// Robust SQLite WASM Engine & Dynamic Solution Evaluator

let SQLInstance = null;

async function loadInitSqlJsFunction() {
  if (typeof window !== 'undefined' && window.initSqlJs) {
    return window.initSqlJs;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (!window.initSqlJs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/sql-wasm.js';
        script.onload = () => resolve(window.initSqlJs);
        script.onerror = () => reject(new Error('Failed to load /sql-wasm.js'));
        document.head.appendChild(script);
      });
      return window.initSqlJs;
    }
  }

  try {
    const mod = await import('sql.js');
    return mod.default || mod;
  } catch {
    throw new Error('Unable to locate SQLite WASM loader.');
  }
}

export async function getSqlInstance() {
  if (SQLInstance) return SQLInstance;
  const initSql = await loadInitSqlJsFunction();
  SQLInstance = await initSql({
    locateFile: (file) => `/${file}`
  });
  return SQLInstance;
}

export class SqlEngine {
  constructor(problemData) {
    this.problem = problemData;
    this.db = null;
    this.expectedResult = problemData.expectedResult || null;
    this.tables = [];
    this.tableSchemas = {}; // tableName -> [{ name, type }]
  }

  async init() {
    const SQL = await getSqlInstance();
    this.db = new SQL.Database();

    // Execute schema & seed SQL
    if (this.problem.schemaSQL) {
      this.db.run(this.problem.schemaSQL);
    }
    if (this.problem.seedSQL) {
      this.db.run(this.problem.seedSQL);
    }

    // Inspect database tables and columns
    this.inspectSchema();

    // If expectedResult is not pre-computed, calculate it by executing hiddenSolution
    if (!this.expectedResult && this.problem.hiddenSolution) {
      try {
        const canonicalRes = this.db.exec(this.problem.hiddenSolution);
        if (canonicalRes.length > 0) {
          this.expectedResult = canonicalRes[0].values;
        }
      } catch (err) {
        console.warn('Could not compute expected result from hiddenSolution:', err);
      }
    }

    return this;
  }

  inspectSchema() {
    const tablesRes = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (tablesRes.length > 0 && tablesRes[0].values) {
      this.tables = tablesRes[0].values.map(r => r[0]);

      this.tables.forEach(tableName => {
        const infoRes = this.db.exec(`PRAGMA table_info(${tableName});`);
        if (infoRes.length > 0) {
          this.tableSchemas[tableName] = infoRes[0].values.map(col => ({
            name: col[1],
            type: col[2] || 'TEXT'
          }));
        }
      });
    }
  }

  // Get sample rows for a table
  getTableSample(tableName, limit = 5) {
    try {
      const res = this.db.exec(`SELECT * FROM ${tableName} LIMIT ${limit};`);
      if (res.length > 0) {
        return {
          columns: res[0].columns,
          values: res[0].values
        };
      }
    } catch {
      // Ignore
    }
    return { columns: [], values: [] };
  }

  // Execute a query
  executeQuery(sql) {
    if (!this.db) throw new Error('Database not initialized.');
    const trimmed = sql.trim();
    if (!trimmed) throw new Error('Please enter a SQL query.');

    const start = performance.now();
    const results = this.db.exec(trimmed);
    const executionTimeMs = +(performance.now() - start).toFixed(2);

    if (results.length === 0) {
      return {
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs,
        message: 'Query executed successfully. 0 rows returned.'
      };
    }

    const last = results[results.length - 1];
    return {
      columns: last.columns,
      values: last.values,
      rowCount: last.values.length,
      executionTimeMs,
      message: `Returned ${last.values.length} row(s) in ${executionTimeMs}ms.`
    };
  }

  // Evaluate user result against ground truth
  evaluateResult(userResult) {
    if (!userResult || !userResult.values) {
      return {
        passed: false,
        feedback: 'Your query did not return any records.',
        userRows: [],
        expectedRows: this.expectedResult || []
      };
    }

    if (!this.expectedResult) {
      return {
        passed: true,
        feedback: 'Query executed successfully.',
        userRows: userResult.values,
        expectedRows: []
      };
    }

    const normalize = (v) => {
      if (v === null || v === undefined) return 'null';
      if (typeof v === 'number') return Math.round(v * 100) / 100;
      return String(v).trim().toLowerCase();
    };

    const userRows = userResult.values.map(r => r.map(normalize));
    const expectedRows = this.expectedResult.map(r => r.map(normalize));

    // Check row count
    if (userRows.length !== expectedRows.length) {
      return {
        passed: false,
        feedback: `Expected ${expectedRows.length} row(s), but your query returned ${userRows.length} row(s).`,
        userRows,
        expectedRows
      };
    }

    // Check values row-by-row
    for (let i = 0; i < userRows.length; i++) {
      if (userRows[i].length !== expectedRows[i].length) {
        return {
          passed: false,
          feedback: `Column count mismatch on row ${i + 1}. Expected ${expectedRows[i].length} columns, got ${userRows[i].length}.`,
          userRows,
          expectedRows
        };
      }
      for (let j = 0; j < userRows[i].length; j++) {
        if (userRows[i][j] !== expectedRows[i][j]) {
          return {
            passed: false,
            feedback: `Value mismatch on row ${i + 1}, column ${j + 1}.`,
            userRows,
            expectedRows
          };
        }
      }
    }

    return {
      passed: true,
      feedback: 'Correct! All rows and columns match expected output.',
      userRows,
      expectedRows
    };
  }

  close() {
    if (this.db) {
      try {
        this.db.close();
      } catch {}
      this.db = null;
    }
  }
}

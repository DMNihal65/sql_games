import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || '';

export const sql = connectionString ? neon(connectionString) : null;

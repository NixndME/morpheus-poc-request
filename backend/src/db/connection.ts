/**
 * Database Connection Module
 * Handles PostgreSQL connection with SSL support for AWS RDS
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse SSL setting - default to false for local dev
const useSSL = process.env.DB_SSL === 'true';

// For AWS RDS, we need to accept the certificate
// Set DB_SSL_REJECT_UNAUTHORIZED=false for RDS without CA bundle
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

console.log('Database config:', {
  host: process.env.DB_HOST || 'postgres-k8s.local',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'morpheus_poc',
  user: process.env.DB_USER || 'admin',
  ssl: useSSL,
  sslRejectUnauthorized: useSSL ? rejectUnauthorized : 'N/A',
  schema: process.env.DB_SCHEMA || 'poc_tracker',
});

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'postgres-k8s.local',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'morpheus_poc',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD,
  // For AWS RDS: ssl: { rejectUnauthorized: false } allows connection without CA bundle
  ssl: useSSL ? { rejectUnauthorized } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Schema name
export const SCHEMA = process.env.DB_SCHEMA || 'poc_tracker';

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper to run queries with schema
export async function query(text: string, params?: any[]) {
  // Set search path for each query
  const queryWithSchema = `SET search_path TO ${SCHEMA}; ${text}`;
  return pool.query(queryWithSchema, params);
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}

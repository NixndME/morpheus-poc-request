"use strict";
/**
 * Database Connection Module
 * Handles PostgreSQL connection with SSL support for AWS RDS
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA = exports.pool = void 0;
exports.testConnection = testConnection;
exports.query = query;
exports.closePool = closePool;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const poolConfig = {
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
exports.pool = new pg_1.Pool(poolConfig);
// Schema name
exports.SCHEMA = process.env.DB_SCHEMA || 'poc_tracker';
// Test connection
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Helper to run queries with schema
async function query(text, params) {
    // Set search path for each query
    const queryWithSchema = `SET search_path TO ${exports.SCHEMA}; ${text}`;
    return exports.pool.query(queryWithSchema, params);
}
// Graceful shutdown
async function closePool() {
    await exports.pool.end();
    console.log('Database pool closed');
}
//# sourceMappingURL=connection.js.map
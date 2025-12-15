/**
 * Database Connection Module
 * Handles PostgreSQL connection with SSL support for AWS RDS
 */
import { Pool } from 'pg';
export declare const pool: Pool;
export declare const SCHEMA: string;
export declare function testConnection(): Promise<boolean>;
export declare function query(text: string, params?: any[]): Promise<import("pg").QueryResult<any>>;
export declare function closePool(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map
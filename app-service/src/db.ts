import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import pg from 'pg';
import fs from 'fs';
import semver from 'semver';

@Injectable()
export class DbClient implements OnModuleInit {
    pool: pg.Pool;

    constructor() {
        this.pool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: +process.env.DB_PORT,
        });
    }

    async onModuleInit() {
        try {
            await this.initDb();
        }
        catch (error) {
            console.error('Failed to initialize the database:', error);
            process.exit(1);
        }
    }

    async query(query: string, values?: any[]): Promise<pg.QueryResult<any>> {
        try {
            return await this.pool.query(query, values);
        }
        catch (error) {
            throw error;
        }
    }

    async initDb() {
        const client = await this.pool.connect();
        const schemaVersionExists = await this.doesTableExist('schema_version');

        if (!schemaVersionExists) {
            await client.query(`
              CREATE TABLE schema_version (
                id SERIAL PRIMARY KEY,
                version VARCHAR(255) NOT NULL
              )
            `);
        }

        const currentVersion = await this.getCurrentVersion();
        const newVersion = '1.0.0';

        if (!currentVersion || semver.gt(newVersion, currentVersion)) {
            console.log('init db...');

            try {
                await client.query('BEGIN');

                const schemaFile = fs.readFileSync(path.resolve(__dirname, './sql/schema.sql')).toString();
                await client.query(schemaFile);

                const dataFile = fs.readFileSync(path.resolve(__dirname, './sql/data.sql')).toString();
                await client.query(dataFile);

                await client.query('INSERT INTO schema_version (version) VALUES ($1)', [newVersion]);
                await client.query('COMMIT');

                console.log('db init complete.');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
    }

    private async getCurrentVersion() {
        const result = await this.query('SELECT version FROM schema_version ORDER BY id DESC LIMIT 1');
        return result.rows[0] ? result.rows[0].version : null;
    };

    private async doesTableExist(tableName) {
        const result = await this.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = $1
          )
        `, [tableName]);
        return result.rows[0].exists;
    };
}

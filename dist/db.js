var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import path from 'path';
import pg from 'pg';
import fs from 'fs';
import semver from 'semver';
export let DbClient = class DbClient {
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
    async query(query, values) {
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
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
    }
    async getCurrentVersion() {
        const result = await this.query('SELECT version FROM schema_version ORDER BY id DESC LIMIT 1');
        return result.rows[0] ? result.rows[0].version : null;
    }
    ;
    async doesTableExist(tableName) {
        const result = await this.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = $1
          )
        `, [tableName]);
        return result.rows[0].exists;
    }
    ;
};
DbClient = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DbClient);
//# sourceMappingURL=db.js.map
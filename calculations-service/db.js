import pg from 'pg';

export class DbClient {
    pool;

    constructor() {
        this.pool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: +process.env.DB_PORT,
        });
    }

    async query(query, values) {
        try {
            return await this.pool.query(query, values);
        }
        catch (error) {
            throw error;
        }
    }
}

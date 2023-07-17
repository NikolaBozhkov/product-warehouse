import { OnModuleInit } from '@nestjs/common';
import pg from 'pg';
export declare class DbClient implements OnModuleInit {
    pool: pg.Pool;
    constructor();
    onModuleInit(): Promise<void>;
    query(query: string, values?: any[]): Promise<pg.QueryResult<any>>;
    initDb(): Promise<void>;
    private getCurrentVersion;
    private doesTableExist;
}

import { Injectable } from '@nestjs/common';
import { LogisticsType } from './models/logistics-type.js';
import { ImportProductInput } from '../warehouses/inputs/ImportProductInput.js';
import { DbClient } from '../db.js';
import { LogisticsHistoryRecord } from './models/logistics-history.model.js';

@Injectable()
export class LogisticsHistoryService {
    constructor(private readonly dbClient: DbClient) { }

    async getAll(warehouseId?: number, date?: Date, type?: LogisticsType) {
        let filters: { [key: string]: any }[] = [
            { warehouse_id: warehouseId },
            { date },
            { type },
        ].filter(u => Object.values(u).every(v => v !== undefined));

        const whereQuery = filters.reduce<string>((result, current, i) => {
            result += `${i !== 0 ? ' AND ' : ''}${Object.keys(current)[0]} = $${i + 1}`;
            return result;
        }, 'WHERE ');

        const values = filters.map(u => Object.values(u)[0]);

        // Amazing query building
        // let whereQuery = `WHERE `;
        // let valueIndex = 1;
        // if (warehouseId) {
        //     whereQuery += `warehouse_id = $${valueIndex}`;

        //     if (date) {
        //         whereQuery += ' AND ';
        //         valueIndex += 1;
        //     }
        // }

        // if (date) {
        //     whereQuery += `date = $${valueIndex}`;
        // }

        const result = await this.dbClient.query<LogisticsHistoryRecord>(`
        SELECT id, warehouse_id AS "warehouseId", date, type FROM warehouses_logistics_history
        ${filters.length !== 0 ? whereQuery : ''};`,
            values);

        result.rows.forEach(r => r.date = new Date(r.date.getTime() - r.date.getTimezoneOffset() * 60000));
        return result.rows;
    }

    async recordOperation(warehouseId: number, logisticsType: LogisticsType, products: ImportProductInput[]) {
        const recordResult = await this.dbClient.query<{ id: number, warehouse_id: number, date: Date, type: LogisticsType }>(`
        INSERT INTO warehouses_logistics_history (warehouse_id, type)
        VALUES ($1, $2)
        RETURNING id, warehouse_id AS "warehouseId", date, type;`,
            [warehouseId, logisticsType]);

        const record = recordResult.rows[0];

        let valuesQuery = '';
        for (var i = 2; i <= products.length + 2; i += 2) {
            valuesQuery += `${i !== 2 ? ',' : ''}($1, $${i}, $${i + 1})`;
        }

        let values = products.reduce<any[]>((values, product) => {
            return values.concat([product.productId, product.amount]);
        }, [record.id]);

        const productRecords = await this.dbClient.query(`
        INSERT INTO logistics_records_products (logistics_record_id, product_id, amount)
        VALUES ${valuesQuery}
        RETURNING logistics_record_id AS "logisticsRecordId", product_id AS "productId", amount;`,
            values);

        return record;
    }

    async getProductsForRecord(recordId: number) {
        const result = await this.dbClient.query(`
        SELECT product_id AS "productId", amount FROM logistics_records_products
        WHERE logistics_record_id = $1;`,
            [recordId]);

        return result.rows;
    }
}

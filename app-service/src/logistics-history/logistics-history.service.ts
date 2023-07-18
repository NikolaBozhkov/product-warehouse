import { Injectable } from '@nestjs/common';
import { LogisticsType } from './models/logistics-type.js';
import { ImportProductInput } from '../warehouses/inputs/ImportProductInput.js';
import { DbClient } from '../db.js';

@Injectable()
export class LogisticsHistoryService {
    constructor(private readonly dbClient: DbClient) { }

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
}

import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { ImportProductInput } from './inputs/ImportProductInput.js';
import { WarehouseEntity } from './models/warehouse.entity.js';

@Injectable()
export class WarehousesService {
    constructor(private readonly dbClient: DbClient) { }

    async getWarehouses(): Promise<WarehouseEntity[]> {
        const result = await this.dbClient.query('SELECT id, size FROM warehouses');
        return result.rows;
    }

    async getWarehouse(id: string): Promise<WarehouseEntity> {
        const result = await this.dbClient.query('SELECT id, size FROM warehouses WHERE id = $1', [id]);
        return result.rows[0];
    }

    async import(toId: string, products: ImportProductInput[], fromId?: string) {
        let valuesQuery = '';
        for (var i = 2; i <= products.length + 2; i += 2) {
            valuesQuery += `${i !== 2 ? ',' : ''}($${i}, $1, $${i + 1})`;
        }

        let values = products.reduce<any[]>((values, product) => {
            return values.concat([product.productId, product.amount]);
        }, [toId]);

        const result = await this.dbClient.query(`
        INSERT INTO product_warehouses (product_id, warehouse_id, amount)
        VALUES ${valuesQuery}
        ON CONFLICT(product_id, warehouse_id) DO UPDATE
        SET
            amount = product_warehouses.amount + EXCLUDED.amount;`,
            values);

        return result.rows;
    }
}

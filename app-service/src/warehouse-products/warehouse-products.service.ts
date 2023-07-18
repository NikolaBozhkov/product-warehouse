import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { WarehouseProduct } from './models/warehouse-product.model.js';

@Injectable()
export class WarehouseProductsService {
    constructor(private readonly dbClient: DbClient) { }

    async getWarehouseProducts(): Promise<WarehouseProduct[]> {
        const result = await this.dbClient.query('SELECT product_id AS "productId", warehouse_id AS "warehouseId", amount FROM product_warehouses');
        return result.rows;
    }

    async getProductsByWarehouseId(warehouseId: number): Promise<WarehouseProduct[]> {
        const result = await this.dbClient.query(`
        SELECT product_id AS "productId", warehouse_id AS "warehouseId", amount FROM product_warehouses
        WHERE warehouse_id = $1`,
            [warehouseId]);
        return result.rows;
    }
}

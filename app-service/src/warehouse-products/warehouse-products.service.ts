import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { WarehouseProduct } from './models/warehouse-product.model.js';
import { WarehouseEntity } from 'src/warehouses/models/warehouse.entity.js';
import { HazardousState } from 'src/warehouses/models/hazardous-state.js';

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

    async getProductsCountPerWarehouseContainingProduct(productId: number): Promise<{ warehouseId: number, productsCount: number }[]> {
        const result = await this.dbClient.query(`
        SELECT id as "warehouseId", "productsCount" FROM (
            SELECT id, COUNT(pw.product_id)::int AS "productsCount" FROM warehouses w
            INNER JOIN product_warehouses pw
            ON pw.warehouse_id = w.id
            GROUP BY (w.id)
        ) AS warehouse
        INNER JOIN product_warehouses pw2
        ON pw2.warehouse_id = warehouse.id
        WHERE pw2.product_id = $1;`,
            [productId]);

        return result.rows;
    }
}

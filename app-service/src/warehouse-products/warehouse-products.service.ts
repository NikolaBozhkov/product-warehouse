import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { WarehouseProduct } from './models/warehouse-product.model.js';

@Injectable()
export class WarehouseProductsService {
    constructor(private readonly dbClient: DbClient) { }

    async getWarehouseProducts() {
        const result = await this.dbClient.query<WarehouseProduct>('SELECT product_id AS "productId", warehouse_id AS "warehouseId", amount FROM product_warehouses');
        return result.rows;
    }

    async getProductsByWarehouseId(warehouseId: number) {
        const result = await this.dbClient.query<WarehouseProduct>(`
        SELECT product_id AS "productId", warehouse_id AS "warehouseId", amount FROM product_warehouses
        WHERE warehouse_id = $1`,
            [warehouseId]);
        return result.rows;
    }

    async getProductsCountPerWarehouseContainingProduct(productId: number) {
        const result = await this.dbClient.query<{
            warehouseId: number,
            size: number,
            stockAmount: number,
            distinctProductsCount: number,
            productAmount: number,
            sizePerUnit: number,
        }>(`
        SELECT
            warehouse.id as "warehouseId",
            size::int,
            "stockAmount"::int,
            "distinctProductsCount",
            p.size_per_unit::int as "sizePerUnit",
            pw2.amount::int AS "productAmount"
            FROM (
                SELECT
                    w.id,
                    w.size,
                    w.stock_amount AS "stockAmount",
                    COUNT(pw.product_id)::int AS "distinctProductsCount"
                FROM warehouses w
                INNER JOIN product_warehouses pw
                ON pw.warehouse_id = w.id
                GROUP BY (w.id)
            ) AS warehouse
        INNER JOIN product_warehouses pw2
        ON pw2.warehouse_id = warehouse.id
        INNER JOIN products p
        ON p.id = pw2.product_id
        WHERE pw2.product_id = $1;`,
            [productId]);

        return result.rows;
    }
}

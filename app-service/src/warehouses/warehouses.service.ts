import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { ImportProductInput } from './inputs/ImportProductInput.js';
import { WarehouseEntity } from './models/warehouse.entity.js';
import { HazardousState } from './models/hazardous-state.js';

@Injectable()
export class WarehousesService {
    constructor(private readonly dbClient: DbClient) { }

    async getWarehouses(): Promise<WarehouseEntity[]> {
        const result = await this.dbClient.query<WarehouseEntity>(
            'SELECT id, size, hazardous_state AS "hazardousState", stock_amount AS "stockAmount", size - stock_amount AS "freeSpace" FROM warehouses');
        return result.rows;
    }

    async getWarehouse(id: number): Promise<WarehouseEntity> {
        const result = await this.dbClient.query<WarehouseEntity>(`
        SELECT id, size, hazardous_state AS "hazardousState", stock_amount AS "stockAmount", size - stock_amount AS "freeSpace"
        FROM warehouses WHERE id = $1`,
            [id]);
        return result.rows[0];
    }

    async import(toId: number, products: ImportProductInput[], requiredSpace: number, fromId?: number) {
        const { valuesQuery, values } = this.buildValuesForImportExport(products, toId);

        const result = await this.dbClient.query(`
        INSERT INTO product_warehouses (product_id, warehouse_id, amount)
        VALUES ${valuesQuery}
        ON CONFLICT(product_id, warehouse_id) DO UPDATE
        SET
            amount = product_warehouses.amount + EXCLUDED.amount
        RETURNING product_id AS "productId", warehouse_id AS "warehouseId", amount;`,
            values);

        await this.dbClient.query(`
        UPDATE warehouses w
        SET stock_amount = w.stock_amount + $1
        WHERE w.id = $2;`,
            [requiredSpace, toId]);

        return result.rows;
    }

    async export(fromId: number, products: ImportProductInput[], freedSpace: number, toId?: number) {
        const { valuesQuery, values } = this.buildValuesForImportExport(products, fromId);

        const result = await this.dbClient.query(`
        UPDATE product_warehouses AS pw
        SET
	        amount = pw.amount - exported.amount::int
        FROM (VALUES ${valuesQuery}) AS exported(product_id, warehouse_id, amount)
        WHERE pw.product_id = exported.product_id::int
	        AND pw.warehouse_id = exported.warehouse_id::int
        RETURNING pw.product_id AS "productId", pw.warehouse_id AS "warehouseId", pw.amount;`,
            values);

        await this.dbClient.query(`DELETE FROM product_warehouses WHERE amount = 0;`);

        await this.dbClient.query(`
        UPDATE warehouses w
        SET stock_amount = w.stock_amount - $1
        WHERE w.id = $2;`,
            [freedSpace, fromId]);

        return result.rows;
    }

    async updateHazardousState(hazardousState: HazardousState, warehouseIds: number[]) {
        const result = await this.dbClient.query(`
        UPDATE warehouses
        SET hazardous_state = $1
        WHERE id IN (${warehouseIds.map((_, i) => `$${i + 2}`).join(',')})
        RETURNING id, size, hazardous_state AS "hazardousState";`,
            [hazardousState, ...warehouseIds]);

        return result.rows;
    }

    private buildValuesForImportExport(products: ImportProductInput[], warehouseId: number): { valuesQuery: string, values: any[] } {
        let valuesQuery = '';
        for (var i = 2; i <= products.length + 2; i += 2) {
            valuesQuery += `${i !== 2 ? ',' : ''}($${i}, $1, $${i + 1})`;
        }

        let values = products.reduce<any[]>((values, product) => {
            return values.concat([product.productId, product.amount]);
        }, [warehouseId]);

        return {
            valuesQuery,
            values,
        };
    }
}

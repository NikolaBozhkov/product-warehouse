import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
import { Product } from './models/product.model.js';

@Injectable()
export class ProductsService {
    constructor(
        private readonly dbClient: DbClient,
    ) {

    }

    async getProducts() {
        const result = await this.dbClient.query<Product>('SELECT id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit" FROM products');
        return result.rows;
    }

    async createProduct(name: string, isHazardous: boolean, sizePerUnit: number) {
        const result = await this.dbClient.query<Product>(`
        INSERT INTO products (name, is_hazardous, size_per_unit)
        VALUES ($1, $2, $3)
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
            [name, isHazardous, sizePerUnit]);
        return result.rows[0];
    }

    async updateProduct(id: number, name?: string, isHazardous?: boolean, sizePerUnit?: number): Promise<Product> {
        let updates: { [key: string]: any }[] = [
            { name },
            { is_hazardous: isHazardous },
            { size_per_unit: sizePerUnit },
        ].filter(u => Object.values(u).every(v => v !== undefined));

        if (updates.length === 0) {
            return;
        }

        const setQuery = updates.reduce<string>((result, current, i) => {
            result += `${i !== 0 ? ',' : ''}${Object.keys(current)[0]} = $${i + 1}`;
            return result;
        }, '');

        const values = updates.map(u => Object.values(u)[0]).concat([id]);

        const result = await this.dbClient.query<Product>(`
        UPDATE products
        SET ${setQuery}
        WHERE id = $${values.length}
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
            values);

        return result.rows[0];
    }

    async deleteProduct(id: number): Promise<Product> {
        const result = await this.dbClient.query<Product>(`
        DELETE FROM products
        WHERE id = $1
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
            [id]);

        return result.rows[0];
    }

    async getProductsByIds(ids: number[]): Promise<Product[]> {
        const result = await this.dbClient.query<Product>(`
        SELECT id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit" FROM products
        WHERE id IN (${ids.map((_, i) => `$${i + 1}`).join(',')})`,
            ids);

        return result.rows;
    }
}

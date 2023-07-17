var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { DbClient } from '../db.js';
export let ProductsService = class ProductsService {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }
    async getProducts() {
        const result = await this.dbClient.query('SELECT id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit" FROM products');
        return result.rows;
    }
    async createProduct(name, isHazardous, sizePerUnit) {
        const result = await this.dbClient.query(`
        INSERT INTO products (name, is_hazardous, size_per_unit)
        VALUES ($1, $2, $3)
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`, [name, isHazardous, sizePerUnit]);
        return result.rows[0];
    }
    async updateProduct(id, name, isHazardous, sizePerUnit) {
        let updates = [
            { name },
            { is_hazardous: isHazardous },
            { size_per_unit: sizePerUnit },
        ].filter(u => Object.values(u).every(v => v !== undefined));
        const setQuery = updates.reduce((result, current, i) => {
            result += `${i !== 0 ? ',' : ''}${Object.keys(current)[0]} = $${i + 1}`;
            return result;
        }, '');
        const values = updates.map(u => Object.values(u)[0]).concat([id]);
        const result = await this.dbClient.query(`
        UPDATE products
        SET ${setQuery}
        WHERE id = $${values.length}
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`, values);
        return result.rows[0];
    }
    async deleteProduct(id) {
        const result = await this.dbClient.query(`
        DELETE FROM products
        WHERE id = $1
        RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`, [id]);
        return result.rows[0];
    }
};
ProductsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbClient])
], ProductsService);
//# sourceMappingURL=products.service.js.map
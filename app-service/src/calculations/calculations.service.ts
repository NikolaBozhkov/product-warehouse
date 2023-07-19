import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { ProductAmount } from '../products/models/product-amount.js';

@Injectable()
export class CalculationsService {
    constructor(private readonly httpService: HttpService) {}

    async getWarehouseStockAmount(warehouseId: number) {
        return this.httpService
            .get(`http://localhost:8081/warehouses/${warehouseId}/stock-amount`)
            .pipe(
                map((res) => +res.data),
            );
    }

    async getWarehouseCombinedStockAmount() {
        return this.httpService
            .get(`http://localhost:8081/warehouses/combined-stock-amount`)
            .pipe(
                map((res) => +res.data),
            );
    }

    async getWarehouseFreeSpace(warehouseId: number) {
        return this.httpService
            .get(`http://localhost:8081/warehouses/${warehouseId}/free-space`)
            .pipe(
                map((res) => +res.data),
            );
    }

    async getRequiredSpace(products: ProductAmount[]) {
        return await firstValueFrom(this.httpService
            .post(`http://localhost:8081/products/calculate-space`, {
                products,
            }, {
                headers: { 'Content-Type': 'application/json' }
            })
            .pipe(
                map((res) => +res.data),
        ));
    }
}

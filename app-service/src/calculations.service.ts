import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class CalculationsService {
    constructor(private readonly httpService: HttpService) {}

    async getWarehouseStockAmount(warehouseId: string) {
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

    async getWarehouseFreeSpace(warehouseId: string) {
        return this.httpService
            .get(`http://localhost:8081/warehouses/${warehouseId}/free-space`)
            .pipe(
                map((res) => +res.data),
            );
    }
}

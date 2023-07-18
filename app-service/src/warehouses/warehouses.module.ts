import { Module } from '@nestjs/common';
import { WarehousesResolver } from './warehouses.resolver.js';
import { WarehousesService } from './warehouses.service.js';
import { DbClient } from '../db.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { CalculationsService } from '../calculations/calculations.service.js';
import { HttpModule } from '@nestjs/axios';
import { ProductsService } from '../products/products.service.js';
import { LogisticsHistoryService } from '../logistics-history/logistics-history.service.js';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    WarehousesResolver,
    WarehousesService,
    WarehouseProductsService,
    DbClient,
    CalculationsService,
    ProductsService,
    LogisticsHistoryService,
  ]
})
export class WarehousesModule {}

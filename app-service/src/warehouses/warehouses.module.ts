import { Module } from '@nestjs/common';
import { WarehousesResolver } from './warehouses.resolver.js';
import { WarehousesService } from './warehouses.service.js';
import { DbClient } from '../db.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { CalculationsService } from '../calculations.service.js';
import { HttpModule } from '@nestjs/axios';
import { ProductsService } from '../products/products.service.js';

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
  ]
})
export class WarehousesModule {}

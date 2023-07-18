import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsResolver } from './products.resolver.js';
import { DbClient } from '../db.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { WarehousesService } from '../warehouses/warehouses.service.js';

@Module({
  providers: [
    ProductsService,
    ProductsResolver,
    DbClient,
    WarehouseProductsService,
    WarehousesService,
  ],
})
export class ProductsModule {}

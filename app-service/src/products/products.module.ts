import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsResolver } from './products.resolver.js';
import { DbClient } from '../db.js';

@Module({
  providers: [ProductsService, ProductsResolver, DbClient],
})
export class ProductsModule {}

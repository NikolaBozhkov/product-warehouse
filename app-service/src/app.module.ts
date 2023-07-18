import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DbClient } from './db.js';
import { ProductsModule } from './products/products.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';
import { WarehouseProductsModule } from './warehouse-products/warehouse-products.module.js';
import { LogisticsHistoryModule } from './logistics-history/logistics-history.module.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    WarehousesModule,
    ProductsModule,
    WarehouseProductsModule,
    LogisticsHistoryModule,
  ],
  providers: [DbClient],
})
export class AppModule {}

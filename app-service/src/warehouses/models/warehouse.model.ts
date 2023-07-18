import { Field, ObjectType, Int } from '@nestjs/graphql';
import { WarehouseProduct } from '../../warehouse-products/models/warehouse-product.model.js';

@ObjectType({ description: 'warehouse' })
export class Warehouse {
  @Field(type => Int)
  id: number;

  @Field(type => Int)
  size: number;

  @Field(type => [WarehouseProduct])
  warehouseProducts: [WarehouseProduct];

  @Field(type => Int)
  stockAmount: number;

  @Field(type => Int)
  freeSpace: number;
}

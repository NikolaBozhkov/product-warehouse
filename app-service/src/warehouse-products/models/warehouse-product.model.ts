import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ description: 'warehouse-product' })
export class WarehouseProduct {
  @Field(type => Int)
  productId: number;

  @Field(type => Int)
  warehouseId: number;

  @Field(type => Int)
  amount: number;
}

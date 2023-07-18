import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ description: 'warehouse-product' })
export class WarehouseProduct {
  @Field(type => ID)
  productId: string;

  @Field(type => ID)
  warehouseId: string;

  @Field(type => Int)
  amount: number;
}

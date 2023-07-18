import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogisticsRecordProduct {
  @Field(type => Int)
  productId: number;

  @Field(type => Int)
  amount: number;
}

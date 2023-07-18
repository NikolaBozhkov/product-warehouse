import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class ImportProductInput {
  @Field(type => Int)
  productId: number;

  @Field(type => Int)
  amount: number;
}

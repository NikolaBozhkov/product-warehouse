import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class ImportProductInput {
  @Field(type => ID)
  productId: string;

  @Field(type => Int)
  amount: number;
}

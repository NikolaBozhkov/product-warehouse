import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ description: 'product' })
export class Product {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field(type => Boolean)
  isHazardous: boolean;

  @Field(type => Int)
  sizePerUnit: number;
}

import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ description: 'product' })
export class Product {
  @Field(type => Int)
  id: number;

  @Field()
  name: string;

  @Field(type => Boolean)
  isHazardous: boolean;

  @Field(type => Int)
  sizePerUnit: number;
}

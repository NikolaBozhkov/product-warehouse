import { Field, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { LogisticsType } from './logistics-type.js';
import { LogisticsRecordProduct } from './logistics-product.model.js';

@ObjectType({ description: 'logistics-history-record' })
export class LogisticsHistoryRecord {
    @Field(type => Int)
    id: number;

    @Field(type => Int)
    warehouseId: number;

    @Field(type => GraphQLISODateTime)
    date: Date;

    @Field(type => String)
    type: LogisticsType;

    @Field(type => [LogisticsRecordProduct])
    products: LogisticsRecordProduct[];
}

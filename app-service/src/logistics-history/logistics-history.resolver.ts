import { Resolver, Query, Args, Int, ResolveField, Parent, GraphQLISODateTime } from '@nestjs/graphql';
import { LogisticsHistoryRecord } from './models/logistics-history.model.js';
import { LogisticsHistoryService } from './logistics-history.service.js';
import { LogisticsType } from './models/logistics-type.js';
import { BadRequestException } from '@nestjs/common';

@Resolver(of => LogisticsHistoryRecord)
export class LogisticsHistoryResolver {
    constructor(
        private readonly logisticsHistoryService: LogisticsHistoryService,
    ) {
    }

    @Query(() => [LogisticsHistoryRecord])
    async logisticsHistory(
        @Args('warehouseId', { type: () => Int, nullable: true }) warehouseId?: number,
        @Args('date', { type: () => GraphQLISODateTime, nullable: true }) date?: Date,
        @Args('type', { type: () => String, nullable: true }) type?: LogisticsType,
    ) {
        if (type && ![LogisticsType.Export, LogisticsType.Import].includes(type)) {
            throw new BadRequestException('Type can only be import or export.');
        }

        return this.logisticsHistoryService.getAll(warehouseId, date, type);
    }

    @ResolveField()
    async products(@Parent() logisticsRecord: LogisticsHistoryRecord) {
        return this.logisticsHistoryService.getProductsForRecord(logisticsRecord.id);
    }
}

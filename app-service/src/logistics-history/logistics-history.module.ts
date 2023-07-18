import { Module } from '@nestjs/common';
import { LogisticsHistoryService } from './logistics-history.service.js';
import { DbClient } from '../db.js';
import { LogisticsHistoryResolver } from './logistics-history.resolver.js';

@Module({
    providers: [
        LogisticsHistoryService,
        LogisticsHistoryResolver,
        DbClient,
    ],
})
export class LogisticsHistoryModule {
}

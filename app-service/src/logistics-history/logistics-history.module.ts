import { Module } from '@nestjs/common';
import { LogisticsHistoryService } from './logistics-history.service.js';
import { DbClient } from 'src/db.js';

@Module({
    providers: [
        LogisticsHistoryService,
        DbClient,
    ],
})
export class LogisticsHistoryModule {
}

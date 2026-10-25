import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { RequestRecordingStorageService } from '../common/services/request-recording-storage.service';
export declare class RequestRecordingRetentionService {
    private readonly dataSource;
    private readonly storage;
    private readonly logger;
    private readonly globalRetentionDays;
    constructor(dataSource: DataSource, config: ConfigService, storage: RequestRecordingStorageService);
    deleteExpiredRecordings(): Promise<number>;
    private findAllExpired;
    private findExpiredByPlan;
    private deleteRecordings;
}

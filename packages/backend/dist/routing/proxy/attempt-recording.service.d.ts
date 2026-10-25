import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import type { StoredAttemptRecording } from './attempt-recording.types';
import { RequestRecordingStorageService } from '../../common/services/request-recording-storage.service';
export declare class AttemptRecordingService {
    private readonly attemptRepo;
    private readonly storage;
    constructor(attemptRepo: Repository<AgentMessage>, storage: RequestRecordingStorageService);
    get available(): boolean;
    save(tenantId: string, requestId: string, attemptId: string, payload: StoredAttemptRecording): Promise<void>;
}

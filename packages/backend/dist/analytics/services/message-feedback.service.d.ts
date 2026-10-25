import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { ManifestRequest } from '../../entities/request.entity';
export declare class MessageFeedbackService {
    private readonly messageRepo;
    private readonly requestRepo?;
    constructor(messageRepo: Repository<AgentMessage>, requestRepo?: Repository<ManifestRequest> | undefined);
    setFeedback(messageId: string, tenantId: string | null, rating: string, tags?: string[], details?: string): Promise<void>;
    clearFeedback(messageId: string, tenantId: string | null): Promise<void>;
    private findFeedbackTarget;
    private findOwnedRequest;
    private findOwnedMessage;
}

import { Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
export declare class AgentRecordingConfigService {
    private readonly agentRepo;
    constructor(agentRepo: Repository<Agent>);
    isRecording(agentId: string | null | undefined): Promise<boolean>;
}

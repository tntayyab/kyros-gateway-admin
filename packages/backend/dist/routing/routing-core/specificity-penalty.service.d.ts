import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { SpecificityCategory } from 'manifest-shared';
export declare class SpecificityPenaltyService {
    private readonly messageRepo;
    private static readonly PENALTY_PER_FLAG;
    private static readonly PENALTY_CAP;
    constructor(messageRepo: Repository<AgentMessage>);
    getPenaltiesForAgent(agentId: string): Promise<Map<SpecificityCategory, number>>;
}

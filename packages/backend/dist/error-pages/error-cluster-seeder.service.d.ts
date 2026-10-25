import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AgentMessage } from '../entities/agent-message.entity';
export declare class ErrorClusterSeederService implements OnModuleInit {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<AgentMessage>);
    onModuleInit(): Promise<void>;
}

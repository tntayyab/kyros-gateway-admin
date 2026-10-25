import { DataSource } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class SetupService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    isSelfHosted(): boolean;
    getLocalLlmHost(): string;
    getEnabledSocialProviders(): string[];
    isEmailConfigured(): boolean;
    isMcpEnabled(): boolean;
    isOllamaAvailable(): Promise<boolean>;
    needsSetup(): Promise<boolean>;
    createFirstAdmin(dto: CreateAdminDto): Promise<void>;
}

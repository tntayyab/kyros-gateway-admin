import { CreateAdminDto } from './dto/create-admin.dto';
import { SetupService } from './setup.service';
export declare class SetupController {
    private readonly setupService;
    constructor(setupService: SetupService);
    getStatus(): Promise<{
        needsSetup: boolean;
        socialProviders: string[];
        isSelfHosted: boolean;
        ollamaAvailable: boolean;
        localLlmHost: string;
        emailConfigured: boolean;
        mcpEnabled: boolean;
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
        ok: true;
    }>;
}

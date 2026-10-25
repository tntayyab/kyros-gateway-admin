import { ConfigService } from '@nestjs/config';
export declare class ManifestRuntimeService {
    private readonly config;
    constructor(config: ConfigService);
    getAuthBaseUrl(): string;
}

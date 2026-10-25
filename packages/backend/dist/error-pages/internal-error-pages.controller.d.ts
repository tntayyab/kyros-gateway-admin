import { ConfigService } from '@nestjs/config';
import { ErrorPagesService } from './error-pages.service';
import { ErrorDiscoveryService } from './error-discovery.service';
import { UpsertErrorPageDto } from './dto/upsert-error-page.dto';
export declare class InternalErrorPagesController {
    private readonly service;
    private readonly discovery;
    private readonly config;
    constructor(service: ErrorPagesService, discovery: ErrorDiscoveryService, config: ConfigService);
    private assertSecret;
    clusters(secret: string): Promise<import("./error-discovery.service").DiscoveredCluster[]>;
    upsert(secret: string, dto: UpsertErrorPageDto): Promise<{
        ok: true;
        slug: string;
    }>;
    remove(secret: string, slug: string): Promise<{
        ok: true;
        slug: string;
    }>;
}

import { ConfigService } from '@nestjs/config';
import { ErrorPagesService } from './error-pages.service';
export declare class PublicErrorPagesController {
    private readonly service;
    private readonly config;
    constructor(service: ErrorPagesService, config: ConfigService);
    private assertEnabled;
    list(): Promise<{
        pages: {
            slug: string;
            title: string;
            h1: string;
            meta_description: string;
            provider: string;
            provider_label: string;
            http_status: number | null;
            category: string;
            category_label: string;
            stats: import("../entities/public-error-page.entity").ErrorPageStats;
            noindex: boolean;
            published_at: string;
            updated_at: string;
        }[];
        cached_at: string;
    }>;
    detail(slug: string): Promise<import("../entities/public-error-page.entity").PublicErrorPage>;
}

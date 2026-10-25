import { OnModuleInit } from '@nestjs/common';
export interface GitHubModel {
    id: string | null;
    name: string;
    context: string;
    maxOutput: string;
    modality: string;
    rateLimit: string;
}
export interface GitHubProvider {
    name: string;
    category: string;
    country: string;
    flag: string;
    url: string;
    baseUrl: string | null;
    description: string;
    footnoteRef: number | null;
    models: GitHubModel[];
}
export declare class FreeModelsSyncService implements OnModuleInit {
    private readonly logger;
    private cache;
    private lastFetchedAt;
    onModuleInit(): void;
    refreshCache(): Promise<number>;
    getAll(): readonly GitHubProvider[];
    getLastFetchedAt(): Date | null;
    private fetchData;
}

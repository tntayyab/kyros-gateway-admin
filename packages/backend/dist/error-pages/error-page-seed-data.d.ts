import type { ErrorPageTrendPoint } from '../entities/public-error-page.entity';
export interface ErrorPageSeed {
    slug: string;
    cluster_key: string;
    provider: string;
    provider_label: string;
    http_status: number;
    category: string;
    category_label: string;
    title: string;
    meta_description: string;
    h1: string;
    body_what: string;
    body_fix: string;
    sample_message: string;
    faq: {
        q: string;
        a: string;
    }[];
    tenants: number;
    volume_7d: number;
    volume_30d: number;
    recovery_rate: number;
    variants?: string[];
}
export declare function seedTrend(volume30d: number, salt: number, endMs: number): ErrorPageTrendPoint[];
export declare const ERROR_PAGE_SEEDS: ErrorPageSeed[];

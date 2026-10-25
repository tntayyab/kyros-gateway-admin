import type { ErrorPageFaqItem, ErrorPageRelatedLink, ErrorPageStats } from '../../entities/public-error-page.entity';
export declare class UpsertErrorPageDto {
    slug: string;
    cluster_key: string;
    provider: string;
    provider_label?: string;
    http_status?: number | null;
    category?: string;
    category_label?: string;
    title: string;
    meta_description: string;
    h1: string;
    body_what?: string;
    body_fix?: string;
    body_manifest?: string;
    sample_message?: string;
    faq?: ErrorPageFaqItem[];
    stats: ErrorPageStats;
    related?: ErrorPageRelatedLink[];
    noindex?: boolean;
}

export interface ErrorPageFaqItem {
    q: string;
    a: string;
}
export interface ErrorPageTrendPoint {
    date: string;
    count: number;
}
export interface ErrorPageStats {
    tenants: number;
    volume_7d: number;
    volume_30d: number;
    recovery_rate: number | null;
    last_seen: string | null;
    trend: ErrorPageTrendPoint[];
    variants?: string[];
}
export interface ErrorPageRelatedLink {
    slug: string;
    title: string;
}
export declare class PublicErrorPage {
    slug: string;
    cluster_key: string;
    provider: string;
    provider_label: string;
    http_status: number | null;
    category: string;
    category_label: string;
    title: string;
    meta_description: string;
    h1: string;
    body_what: string;
    body_fix: string;
    body_manifest: string;
    sample_message: string;
    faq: ErrorPageFaqItem[];
    stats: ErrorPageStats;
    related: ErrorPageRelatedLink[];
    noindex: boolean;
    published_at: string;
    updated_at: string;
}

export interface OAuthTokenBlob {
    t: string;
    r: string;
    e: number;
    u?: string;
}
export declare function isOAuthTokenBlob(value: unknown): value is OAuthTokenBlob;
export declare function parseOAuthTokenBlob(rawValue: string): OAuthTokenBlob | null;
export declare function serializeOAuthTokenBlob(blob: OAuthTokenBlob): string;

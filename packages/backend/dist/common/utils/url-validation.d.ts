export declare function isIpLiteral(host: string): boolean;
export declare function isPrivateIp(ip: string): boolean;
export declare function isCloudMetadataIp(ip: string): boolean;
export declare function validatePublicUrl(url: string, opts?: {
    allowPrivate?: boolean;
}): Promise<void>;

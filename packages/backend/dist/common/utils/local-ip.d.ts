import type { Request } from 'express';
export declare function isLoopbackIp(ip: string): boolean;
export declare function getSocketRemoteAddress(request: Request): string | undefined;
export declare function isLoopbackPeer(request: Request): boolean;

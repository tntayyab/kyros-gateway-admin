import type { NextFunction, Request, Response } from 'express';
interface RateLimitResponseOptions {
    statusCode: number;
    message: unknown;
}
export declare function createRateLimitReachedHandler(name: string): (req: Request, res: Response, _next: NextFunction, options: RateLimitResponseOptions) => void;
export {};

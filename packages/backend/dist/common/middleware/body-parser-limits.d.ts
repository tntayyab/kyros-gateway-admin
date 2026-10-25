import * as express from 'express';
export declare const API_BODY_LIMIT = "1mb";
export declare const PROXY_BODY_LIMIT = "512mb";
export declare const PROXY_BODY_LIMIT_BYTES: number;
export declare function createProxyBodyBudgetMiddleware(): express.RequestHandler;
export declare function bodyParserErrorHandler(err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction): void;

import type { Request, Response } from 'express';
export declare function shouldCompress(req: Request, res: Response, defaultFilter?: (req: Request, res: Response) => boolean): boolean;

import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ProxyMessageRecorder } from './proxy-message-recorder';
export declare function isChatRenderingClient(req: Request): boolean;
export declare class ProxyExceptionFilter implements ExceptionFilter {
    private readonly config;
    private readonly recorder;
    constructor(config: ConfigService, recorder: ProxyMessageRecorder);
    private recordExpiredKey;
    catch(exception: HttpException, host: ArgumentsHost): void;
}

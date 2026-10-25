import { ExceptionFilter, NotFoundException, ArgumentsHost } from '@nestjs/common';
export declare class SpaFallbackFilter implements ExceptionFilter {
    private readonly indexContent;
    constructor(betterAuthUrl?: string);
    catch(exception: NotFoundException, host: ArgumentsHost): void;
}

import { OnModuleInit } from '@nestjs/common';
import { ErrorPagesService } from './error-pages.service';
export declare class ErrorPageSeederService implements OnModuleInit {
    private readonly pages;
    private readonly logger;
    constructor(pages: ErrorPagesService);
    onModuleInit(): Promise<void>;
}

import { ShutdownService } from './shutdown.service';
export declare class HealthController {
    private readonly shutdown;
    private readonly startTime;
    constructor(shutdown: ShutdownService);
    getHealth(): {
        status: string;
        uptime_seconds: number;
    };
}

import { Request } from 'express';
import { Repository } from 'typeorm';
import { WaitlistClaim } from '../entities/waitlist-claim.entity';
import { PivotClaimDto } from './dto/pivot-claim.dto';
export declare function claimRequestIsSameOrigin(headers: {
    origin?: string | string[];
    host?: string | string[];
}): boolean;
export declare class WaitlistController {
    private readonly claimRepo;
    constructor(claimRepo: Repository<WaitlistClaim>);
    receiveClaim(): {
        ok: boolean;
    };
    receivePivotClaim(dto: PivotClaimDto, req: Request): Promise<{
        ok: boolean;
    }>;
}

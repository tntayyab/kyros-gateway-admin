import { Tier, MomentumInfo } from './types';
export interface MomentumInput {
    recentTiers: Tier[];
}
export declare function applyMomentum(rawScore: number, lastUserMessageLength: number, momentum: MomentumInput | undefined): {
    effectiveScore: number;
    info: MomentumInfo;
};

import type { ModelRoute, ResponseMode } from 'manifest-shared';
export interface EffectiveRoutes {
    primaryRoute: ModelRoute | null;
    fallbackRoutes: ModelRoute[] | null;
}
export declare function assertStreamableResponseMode(responseMode: ResponseMode | null | undefined, scopeLabel: string, primaryRoute: ModelRoute | null | undefined, fallbackRoutes: ModelRoute[] | null | undefined): void;
export declare function effectiveRoutesForResponseMode(responseMode: ResponseMode | null | undefined, primaryRoute: ModelRoute | null | undefined, fallbackRoutes: ModelRoute[] | null | undefined): EffectiveRoutes;

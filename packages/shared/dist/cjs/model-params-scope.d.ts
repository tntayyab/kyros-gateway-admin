export declare function modelParamsScopeForTier(tier: string): string;
export declare function modelParamsScopeForSpecificity(category: string): string;
export declare function modelParamsScopeForHeaderTier(headerTierId: string): string;
export interface ModelParamsRoutingScopeInput {
    tier: string;
    specificityCategory?: string;
    headerTierId?: string;
}
export declare function modelParamsScopeForRouting(input: ModelParamsRoutingScopeInput): string;
//# sourceMappingURL=model-params-scope.d.ts.map
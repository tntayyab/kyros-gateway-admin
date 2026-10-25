interface DocsCatalog {
    list(): Promise<{
        id: string;
    }[]>;
}
interface ModelsDevCatalog {
    getModelsForProvider(providerId: string): {
        id: string;
    }[];
}
export interface GatewayModelRow {
    model_name: string;
    provider: string;
    display_name?: string | null;
}
export declare function publishedOpencodeGoIds(models: readonly {
    provider: string;
}[], docs: DocsCatalog | null, modelsDev: ModelsDevCatalog | null): Promise<Set<string>>;
export declare function dropShadowedGatewayModels<T extends GatewayModelRow>(rows: T[], published: ReadonlySet<string>): T[];
export {};

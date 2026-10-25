export interface IngestionContext {
    tenantId: string;
    agentId: string;
    agentName: string;
    userId: string | null;
}
export interface RequestWithManifestErrorContext {
    manifestErrorContext?: IngestionContext;
}

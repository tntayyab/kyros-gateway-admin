export interface VertexDeployment {
    project: string;
    location: string;
}
export declare function parseVertexDeployment(region?: string | null): VertexDeployment | null;
export declare function formatVertexDeployment(deployment: VertexDeployment): string;
export declare function getVertexBaseUrl(deployment: VertexDeployment): string;

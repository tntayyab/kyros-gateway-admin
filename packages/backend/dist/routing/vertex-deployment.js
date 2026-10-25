"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVertexDeployment = parseVertexDeployment;
exports.formatVertexDeployment = formatVertexDeployment;
exports.getVertexBaseUrl = getVertexBaseUrl;
const PROJECT_ID = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const LOCATION = /^(?:global|[a-z]+-[a-z]+\d+)$/;
function parseVertexDeployment(region) {
    if (!region)
        return null;
    const [project, location, ...rest] = region.trim().split('/');
    if (rest.length > 0 || !project || !location)
        return null;
    if (!PROJECT_ID.test(project) || !LOCATION.test(location))
        return null;
    return { project, location };
}
function formatVertexDeployment(deployment) {
    return `${deployment.project}/${deployment.location}`;
}
function getVertexBaseUrl(deployment) {
    const host = deployment.location === 'global'
        ? 'https://aiplatform.googleapis.com'
        : `https://${deployment.location}-aiplatform.googleapis.com`;
    return `${host}/v1/projects/${deployment.project}/locations/${deployment.location}`;
}
//# sourceMappingURL=vertex-deployment.js.map
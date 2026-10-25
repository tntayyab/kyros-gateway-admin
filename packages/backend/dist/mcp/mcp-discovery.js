"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountMcpDiscovery = mountMcpDiscovery;
exports.mountMcpUnavailable = mountMcpUnavailable;
const oauth_provider_1 = require("@better-auth/oauth-provider");
const node_1 = require("better-auth/node");
const mcp_oauth_response_1 = require("../auth/mcp-oauth-response");
const auth_instance_1 = require("../auth/auth.instance");
const PROTECTED_RESOURCE_PATHS = [
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-protected-resource/api/v1/mcp',
];
const cors = (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '86400');
};
function mountMcpDiscovery(app) {
    const expressApp = app.getHttpAdapter().getInstance();
    const authServerMetadata = (0, oauth_provider_1.oauthProviderAuthServerMetadata)(auth_instance_1.authInstance);
    const serveAuthMetadata = async (req, res) => {
        cors(res);
        try {
            const webRequest = new globalThis.Request(`${(0, auth_instance_1.authOriginForHost)(req.headers.host)}${req.originalUrl}`, {
                method: req.method,
                headers: (0, node_1.fromNodeHeaders)(req.headers),
            });
            const response = await (0, mcp_oauth_response_1.mcpOAuthResponse)(webRequest, await authServerMetadata(webRequest));
            response.headers.forEach((value, key) => res.set(key, value));
            res.status(response.status).send(req.method === 'HEAD' ? undefined : await response.text());
        }
        catch {
            res.status(404).json({ statusCode: 404, message: 'OAuth metadata unavailable' });
        }
    };
    expressApp.get('/.well-known/oauth-authorization-server/api/auth', (req, res) => {
        void serveAuthMetadata(req, res);
    });
    expressApp.get('/.well-known/oauth-authorization-server', (_req, res) => {
        cors(res);
        res.status(404).json({ statusCode: 404, message: 'OAuth metadata unavailable' });
    });
    for (const path of PROTECTED_RESOURCE_PATHS) {
        expressApp.get(path, (req, res) => {
            cors(res);
            res.status(200).json({
                resource: (0, auth_instance_1.mcpResourceForHost)(req.headers.host),
                authorization_servers: [(0, auth_instance_1.authIssuerForHost)(req.headers.host)],
                bearer_methods_supported: ['header'],
                scopes_supported: [...auth_instance_1.MCP_SCOPES],
            });
        });
    }
}
function mountMcpUnavailable(app) {
    const expressApp = app.getHttpAdapter().getInstance();
    for (const path of [
        '/.well-known/oauth-authorization-server',
        '/.well-known/oauth-authorization-server/api/auth',
        ...PROTECTED_RESOURCE_PATHS,
    ]) {
        expressApp.get(path, (_req, res) => {
            cors(res);
            res.status(404).json({ statusCode: 404, message: 'MCP is not enabled on this install' });
        });
    }
}
//# sourceMappingURL=mcp-discovery.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpOAuthResponse = mcpOAuthResponse;
async function mcpOAuthResponse(request, response) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/auth/oauth2/register' && response.status === 401) {
        const body = (await response
            .clone()
            .json()
            .catch(() => null));
        if (body?.error_description === 'Authentication required for client registration' &&
            !body.error) {
            return jsonResponse(response, {
                error: 'invalid_client',
                error_description: 'Anonymous client registration is disabled. Use a client ID metadata document (CIMD), or sign in to register a client.',
            });
        }
    }
    if (pathname.includes('/.well-known/oauth-authorization-server') ||
        pathname.includes('/.well-known/openid-configuration')) {
        const body = (await response
            .clone()
            .json()
            .catch(() => null));
        if (body?.registration_endpoint) {
            delete body.registration_endpoint;
            return jsonResponse(response, body);
        }
    }
    if (pathname === '/api/auth/oauth2/authorize' && response.status === 302) {
        const location = response.headers.get('location');
        if (location &&
            new URL(location, request.url).searchParams.get('error') === 'invalid_redirect') {
            const headers = new Headers(response.headers);
            headers.set('location', '/oauth-error?error=invalid_redirect_uri');
            return new Response(null, { status: response.status, headers });
        }
    }
    return response;
}
function jsonResponse(original, body) {
    const headers = new Headers(original.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('content-type', 'application/json');
    return new Response(JSON.stringify(body), { status: original.status, headers });
}
//# sourceMappingURL=mcp-oauth-response.js.map
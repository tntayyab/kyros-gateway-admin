"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyProbeError = classifyProbeError;
function classifyProbeError(input) {
    const { url, error, status, contentType, emptyModels } = input;
    if (emptyModels) {
        return {
            kind: 'empty_models',
            message: `${url} is reachable but reports no models. Load a model in your LLM server ` +
                `(LM Studio → My Models, ollama pull) and try again.`,
        };
    }
    if (status !== undefined) {
        if (status === 401 || status === 403) {
            return {
                kind: 'unauthorized',
                message: `${url} rejected the request (HTTP ${status}). If your server requires an API ` +
                    `key, add it via the Advanced form.`,
            };
        }
        if (status === 404) {
            return {
                kind: 'not_found',
                message: `${url} returned 404. The server is up but /v1/models isn't exposed — check ` +
                    `that the OpenAI-compatible endpoints are enabled (recent LM Studio / Ollama ` +
                    `builds expose them by default).`,
            };
        }
        return {
            kind: 'bad_status',
            message: `${url} returned HTTP ${status}. Check the server logs for details.`,
        };
    }
    if (contentType !== undefined) {
        return {
            kind: 'non_json',
            message: `${url} returned ${contentType || 'no content-type'} instead of JSON. ` +
                `Double-check the port and make sure the base URL ends in /v1.`,
        };
    }
    const cause = error?.cause;
    const code = error?.code ?? cause?.code;
    const name = error?.name ?? cause?.name;
    const directMsg = error?.message ?? '';
    const causeMsg = cause?.message ?? '';
    const msg = [directMsg, causeMsg].filter(Boolean).join(' | ');
    if (name === 'AbortError') {
        return {
            kind: 'timeout',
            message: `No response from ${url} within 5 s. The server may be loading a model — ` +
                `wait a moment and retry.`,
        };
    }
    if (code === 'ECONNREFUSED' || /ECONNREFUSED/i.test(msg)) {
        return {
            kind: 'connection_refused',
            message: `No server is listening on ${url}.\nYou can start it with the command below.`,
        };
    }
    if (code === 'ENOTFOUND' || /ENOTFOUND|getaddrinfo/i.test(msg)) {
        return {
            kind: 'dns_failure',
            message: `Could not resolve the hostname in ${url}. Inside Docker use ` +
                `host.docker.internal; inside Podman use host.containers.internal; ` +
                `natively use localhost.`,
        };
    }
    if (/EPROTO|SSL|TLS|wrong version number/i.test(msg)) {
        return {
            kind: 'tls_mismatch',
            message: `${url} isn't speaking TLS. Local LLM servers usually serve plain HTTP — ` +
                `try http:// instead of https://.`,
        };
    }
    return {
        kind: 'unknown',
        message: `Could not reach ${url}: ${msg || 'unknown error'}`,
    };
}
//# sourceMappingURL=probe-error.js.map
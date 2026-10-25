"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchClientMetadataResource = void 0;
const host_1 = require("@better-auth/core/utils/host");
const promises_1 = require("node:dns/promises");
const node_https_1 = require("node:https");
const node_net_1 = require("node:net");
const node_stream_1 = require("node:stream");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const url_validation_1 = require("../common/utils/url-validation");
const BODY_FORBIDDEN_RESPONSE_STATUSES = new Set([204, 205, 304]);
function responseHeaders(headers) {
    const result = new Headers();
    for (const [name, value] of Object.entries(headers)) {
        if (Array.isArray(value)) {
            for (const item of value)
                result.append(name, item);
        }
        else if (value !== undefined) {
            result.append(name, value);
        }
    }
    return result;
}
function selectPinnedAddress(addresses, allowPrivate) {
    if (addresses.length === 0) {
        throw new TypeError('metadata hostname returned no DNS addresses');
    }
    for (const result of addresses) {
        if ((0, url_validation_1.isCloudMetadataIp)(result.address)) {
            throw new TypeError('metadata hostname must not resolve to a cloud metadata address');
        }
        if (!allowPrivate && !(0, host_1.isPublicRoutableHost)(result.address)) {
            throw new TypeError('metadata hostname must resolve only to public-routable addresses');
        }
    }
    return addresses.find(({ family }) => family === 4) ?? addresses[0];
}
function createPinnedLookup(pinnedAddress) {
    return (_hostname, options, callback) => {
        if (options.all) {
            callback(null, [pinnedAddress]);
            return;
        }
        callback(null, pinnedAddress.address, pinnedAddress.family);
    };
}
const fetchClientMetadataResource = async (input, init) => {
    const webRequest = new Request(input, init);
    const url = new URL(webRequest.url);
    if (url.protocol !== 'https:') {
        throw new TypeError('CIMD Node transport requires an HTTPS URL');
    }
    if (webRequest.method !== 'GET' && webRequest.method !== 'HEAD') {
        throw new TypeError('CIMD Node transport supports only GET and HEAD');
    }
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    if ((0, node_net_1.isIP)(hostname) !== 0) {
        throw new TypeError('CIMD Node transport requires a hostname, not an IP literal');
    }
    const allowPrivate = (0, detect_self_hosted_1.isSelfHosted)();
    let addresses;
    try {
        addresses = await (0, promises_1.lookup)(hostname, { all: true, verbatim: true });
    }
    catch (error) {
        if (!allowPrivate)
            throw error;
    }
    const pinnedAddress = addresses ? selectPinnedAddress(addresses, allowPrivate) : undefined;
    const headers = Object.fromEntries(webRequest.headers.entries());
    headers.host = url.host;
    const signal = init?.signal ?? (input instanceof Request ? input.signal : webRequest.signal);
    return new Promise((resolve, reject) => {
        const options = {
            agent: false,
            autoSelectFamily: false,
            headers,
            method: webRequest.method,
            servername: hostname,
            signal,
            ...(pinnedAddress ? { lookup: createPinnedLookup(pinnedAddress) } : {}),
            timeout: 10_000,
        };
        const clientRequest = (0, node_https_1.request)(url, options, (response) => {
            const status = response.statusCode ?? 500;
            if (status < 200 || status > 599) {
                response.destroy();
                reject(new TypeError(`metadata server returned an invalid HTTP status: ${status}`));
                return;
            }
            const hasNoBody = webRequest.method === 'HEAD' || BODY_FORBIDDEN_RESPONSE_STATUSES.has(status);
            if (hasNoBody)
                response.resume();
            const body = hasNoBody ? null : node_stream_1.Readable.toWeb(response);
            try {
                resolve(new Response(body, {
                    headers: responseHeaders(response.headers),
                    status,
                    statusText: response.statusMessage,
                }));
            }
            catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
        clientRequest.once('timeout', () => clientRequest.destroy(new Error('CIMD metadata request timed out')));
        clientRequest.once('upgrade', (_response, socket) => {
            socket.destroy();
            reject(new Error('CIMD metadata request returned an unsupported protocol upgrade'));
        });
        clientRequest.once('error', reject);
        clientRequest.end();
    });
};
exports.fetchClientMetadataResource = fetchClientMetadataResource;
//# sourceMappingURL=cimd-client-metadata-fetch.js.map
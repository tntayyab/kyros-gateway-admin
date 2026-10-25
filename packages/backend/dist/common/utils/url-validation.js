"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIpLiteral = isIpLiteral;
exports.isPrivateIp = isPrivateIp;
exports.isCloudMetadataIp = isCloudMetadataIp;
exports.validatePublicUrl = validatePublicUrl;
const promises_1 = require("dns/promises");
const net_1 = require("net");
const PRIVATE_RANGES = [
    cidr('127.0.0.0', 8),
    cidr('10.0.0.0', 8),
    cidr('172.16.0.0', 12),
    cidr('192.168.0.0', 16),
    cidr('169.254.0.0', 16),
    cidr('100.64.0.0', 10),
    cidr('0.0.0.0', 8),
];
const PRIVATE_V6_PREFIXES = ['::1', 'fc', 'fd', 'fe80::'];
function cidr(base, prefix) {
    const addr = ipv4ToBigInt(base);
    const mask = (BigInt('0xFFFFFFFF') << BigInt(32 - prefix)) & BigInt('0xFFFFFFFF');
    return { addr: addr & mask, mask };
}
function ipv4ToBigInt(ip) {
    const parts = ip.split('.').map(Number);
    return (BigInt((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) & BigInt('0xFFFFFFFF'));
}
function isIpLiteral(host) {
    return (0, net_1.isIP)(host) !== 0;
}
function unwrapMappedIpv4(host) {
    if ((0, net_1.isIP)(host) !== 6)
        return host;
    const parseGroups = (segment) => segment === ''
        ? []
        : segment.split(':').flatMap((part) => {
            const dotted = part.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
            if (dotted) {
                const o = dotted.slice(1).map(Number);
                return [(o[0] << 8) | o[1], (o[2] << 8) | o[3]];
            }
            return [parseInt(part, 16)];
        });
    const [head, tail] = host.toLowerCase().split('::');
    const left = parseGroups(head);
    const right = tail === undefined ? [] : parseGroups(tail);
    const hextets = [...left, ...Array(8 - left.length - right.length).fill(0), ...right];
    const mapped = hextets[0] === 0 &&
        hextets[1] === 0 &&
        hextets[2] === 0 &&
        hextets[3] === 0 &&
        hextets[4] === 0 &&
        hextets[5] === 0xffff;
    if (!mapped)
        return host;
    const hi = hextets[6];
    const lo = hextets[7];
    return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
}
function isPrivateIp(ip) {
    const normalizedIp = unwrapMappedIpv4(ip);
    if (normalizedIp.includes(':')) {
        const lower = normalizedIp.toLowerCase();
        return PRIVATE_V6_PREFIXES.some((prefix) => lower.startsWith(prefix));
    }
    const parsed = normalizedIp.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!parsed)
        return false;
    const addr = ipv4ToBigInt(normalizedIp);
    return PRIVATE_RANGES.some((range) => (addr & range.mask) === range.addr);
}
const CLOUD_METADATA_RANGES = [
    cidr('169.254.169.254', 32),
    cidr('169.254.169.253', 32),
    cidr('100.100.100.200', 32),
];
const CLOUD_METADATA_V6 = ['fd00:ec2::254'];
function isCloudMetadataIp(ip) {
    const normalizedIp = unwrapMappedIpv4(ip);
    if (normalizedIp.includes(':')) {
        const lower = normalizedIp.toLowerCase();
        return CLOUD_METADATA_V6.some((metadata) => lower === metadata);
    }
    const parsed = normalizedIp.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!parsed)
        return false;
    const addr = ipv4ToBigInt(normalizedIp);
    return CLOUD_METADATA_RANGES.some((range) => (addr & range.mask) === range.addr);
}
async function validatePublicUrl(url, opts = {}) {
    if (process.env['NODE_ENV'] === 'test' && process.env['SKIP_SSRF_VALIDATION'] !== 'false')
        return;
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error('Invalid URL format');
    }
    const allowPrivate = opts.allowPrivate === true;
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Only http and https URLs are allowed');
    }
    if (parsed.protocol === 'http:' && !allowPrivate) {
        throw new Error('Only https URLs are allowed in cloud mode. ' +
            'Self-hosted installs allow http:// for private destinations — ' +
            'set MANIFEST_MODE=selfhosted if you are running Manifest yourself ' +
            '(e.g. inside Docker, Podman, or Kubernetes).');
    }
    const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
    if (isCloudMetadataIp(hostname)) {
        throw new Error('URLs pointing to cloud metadata endpoints are not allowed');
    }
    if (isPrivateIp(hostname)) {
        if (!allowPrivate) {
            throw new Error('URLs pointing to private or internal networks are not allowed');
        }
        return;
    }
    let addresses;
    if (isIpLiteral(hostname)) {
        addresses = [{ address: hostname }];
    }
    else {
        try {
            const result = await (0, promises_1.lookup)(hostname, { all: true });
            addresses = Array.isArray(result) ? result : [result];
        }
        catch {
            if (allowPrivate)
                return;
            throw new Error(`Failed to resolve hostname: ${hostname}`);
        }
    }
    let anyPublic = false;
    for (const { address } of addresses) {
        if (isCloudMetadataIp(address)) {
            throw new Error('URLs pointing to cloud metadata endpoints are not allowed');
        }
        if (isPrivateIp(address)) {
            if (!allowPrivate) {
                throw new Error('URLs pointing to private or internal networks are not allowed');
            }
        }
        else {
            anyPublic = true;
        }
    }
    if (parsed.protocol === 'http:' && anyPublic) {
        throw new Error('http:// is only allowed for private hosts');
    }
}
//# sourceMappingURL=url-validation.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpencodeGoCatalogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpencodeGoCatalogService = exports.OPENCODE_GO_BUDGET_5H_USD = void 0;
const common_1 = require("@nestjs/common");
const CATALOG_URL = 'https://raw.githubusercontent.com/anomalyco/opencode/dev/packages/web/src/content/docs/go.mdx';
const CACHE_TTL_MS = 60 * 60 * 1000;
const ERROR_BACKOFF_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;
exports.OPENCODE_GO_BUDGET_5H_USD = 12;
let OpencodeGoCatalogService = OpencodeGoCatalogService_1 = class OpencodeGoCatalogService {
    logger = new common_1.Logger(OpencodeGoCatalogService_1.name);
    cache = null;
    lastGood = null;
    costByModelId = new Map();
    formatByModelId = new Map();
    inflight = null;
    onModuleInit() {
        void this.list().catch(() => {
        });
    }
    async list() {
        const now = Date.now();
        if (this.cache && this.cache.expiresAt > now) {
            return this.cache.entries;
        }
        if (this.inflight) {
            return this.inflight;
        }
        return this.startFetch(now);
    }
    async refresh() {
        return this.startFetch(Date.now());
    }
    startFetch(now) {
        const request = this.fetchAndCache(now);
        const tracked = request.finally(() => {
            if (this.inflight === tracked) {
                this.inflight = null;
            }
        });
        this.inflight = tracked;
        return tracked;
    }
    async fetchAndCache(now) {
        try {
            const response = await fetch(CATALOG_URL, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            if (!response.ok) {
                this.logger.warn(`OpenCode Go catalog fetch returned ${response.status}`);
                return this.cacheFallback(now);
            }
            const mdx = await response.text();
            const entries = this.parse(mdx);
            if (entries.length === 0) {
                this.logger.warn('OpenCode Go catalog parsed zero entries — docs format may have changed');
                return this.cacheFallback(now);
            }
            this.cache = { entries, expiresAt: now + CACHE_TTL_MS };
            this.lastGood = entries;
            this.rebuildIndexes(entries);
            this.logger.log(`OpenCode Go catalog loaded: ${entries.length} models`);
            return entries;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`OpenCode Go catalog fetch failed: ${message}`);
            return this.cacheFallback(now);
        }
    }
    getCostPerRequest(modelId) {
        const bare = bareOpencodeGoModelId(modelId);
        if (!bare)
            return null;
        return this.costByModelId.get(bare) ?? null;
    }
    getFormat(modelId) {
        const bare = bareOpencodeGoModelId(modelId);
        if (!bare)
            return null;
        return this.formatByModelId.get(bare) ?? null;
    }
    async resolveCostPerRequest(modelId) {
        if (!modelId)
            return null;
        if (this.costByModelId.size === 0) {
            await this.list();
        }
        return this.getCostPerRequest(modelId);
    }
    async resolveFormat(modelId) {
        if (!modelId)
            return null;
        if (this.formatByModelId.size === 0) {
            await this.list();
        }
        return this.getFormat(modelId);
    }
    cacheFallback(now) {
        const entries = this.lastGood ?? [];
        this.cache = { entries, expiresAt: now + ERROR_BACKOFF_MS };
        return entries;
    }
    parse(mdx) {
        const costByName = this.parseLimits(mdx);
        const rowRe = /\|\s*([A-Za-z][^|]*?)\s*\|\s*([a-z][a-z0-9.-]*)\s*\|\s*`?https:\/\/opencode\.ai\/zen\/go\/v1\/(chat\/completions|messages|responses)`?\s*\|/g;
        const entries = [];
        const seen = new Set();
        let match;
        while ((match = rowRe.exec(mdx)) !== null) {
            const [, rawName, modelId, endpointSuffix] = match;
            const displayName = rawName.trim();
            if (seen.has(modelId))
                continue;
            seen.add(modelId);
            entries.push({
                id: modelId,
                displayName,
                format: endpointSuffix === 'messages'
                    ? 'anthropic'
                    : endpointSuffix === 'responses'
                        ? 'responses'
                        : 'openai',
                costPerRequestUsd: costByName.get(normalizeDisplayName(displayName)) ?? null,
            });
        }
        return entries;
    }
    parseLimits(mdx) {
        const out = new Map();
        for (const line of mdx.split('\n')) {
            const cells = splitTableRow(line);
            if (cells === null || cells.length < 4)
                continue;
            const [rawName, ...rest] = cells;
            if (!/^[A-Za-z]/.test(rawName))
                continue;
            const requestsPer5h = parseRequestCount(rest[0]);
            if (requestsPer5h === null)
                continue;
            const key = normalizeDisplayName(rawName);
            if (out.has(key))
                continue;
            out.set(key, exports.OPENCODE_GO_BUDGET_5H_USD / requestsPer5h);
        }
        return out;
    }
    rebuildIndexes(entries) {
        const nextCosts = new Map();
        const nextFormats = new Map();
        for (const entry of entries) {
            nextFormats.set(entry.id, entry.format);
            if (entry.costPerRequestUsd != null) {
                nextCosts.set(entry.id, entry.costPerRequestUsd);
            }
        }
        this.costByModelId = nextCosts;
        this.formatByModelId = nextFormats;
    }
    resetCache() {
        this.cache = null;
        this.lastGood = null;
        this.costByModelId = new Map();
        this.formatByModelId = new Map();
        this.inflight = null;
    }
};
exports.OpencodeGoCatalogService = OpencodeGoCatalogService;
exports.OpencodeGoCatalogService = OpencodeGoCatalogService = OpencodeGoCatalogService_1 = __decorate([
    (0, common_1.Injectable)()
], OpencodeGoCatalogService);
function bareOpencodeGoModelId(modelId) {
    if (!modelId)
        return null;
    return modelId.startsWith('opencode-go/') ? modelId.slice('opencode-go/'.length) : modelId;
}
function normalizeDisplayName(name) {
    return (name
        .split('<')[0]
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase());
}
function splitTableRow(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|'))
        return null;
    const body = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);
    return body.split('|').map((cell) => cell.trim());
}
function parseRequestCount(cell) {
    const effective = cell
        .replace(/~~[^~]*~~/g, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\*/g, '')
        .trim();
    if (!/^[0-9][0-9,]*$/.test(effective))
        return null;
    const value = Number(effective.replace(/,/g, ''));
    return Number.isFinite(value) && value > 0 ? value : null;
}
//# sourceMappingURL=opencode-go-catalog.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderTierService = exports.RESERVED_HEADER_KEYS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const manifest_shared_1 = require("manifest-shared");
const header_tier_entity_1 = require("../../entities/header-tier.entity");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const routing_cache_service_1 = require("../routing-core/routing-cache.service");
const route_helpers_1 = require("../routing-core/route-helpers");
const resolve_model_route_1 = require("../routing-core/resolve-model-route");
const response_mode_guard_1 = require("../routing-core/response-mode-guard");
exports.RESERVED_HEADER_KEYS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'proxy-authorization',
    'x-api-key',
]);
const HEADER_KEY_RE = /^[a-z0-9-]+$/;
const MAX_NAME_LEN = 32;
const MAX_HEADER_VALUE_LEN = 128;
let HeaderTierService = class HeaderTierService {
    repo;
    routingCache;
    discoveryService;
    constructor(repo, routingCache, discoveryService) {
        this.repo = repo;
        this.routingCache = routingCache;
        this.discoveryService = discoveryService;
    }
    async list(agentId) {
        const cached = this.routingCache.getHeaderTiers(agentId);
        if (cached)
            return cached;
        const rows = await this.repo.find({
            where: { agent_id: agentId },
            order: { sort_order: 'ASC' },
        });
        this.routingCache.setHeaderTiers(agentId, rows);
        return rows;
    }
    async create(agentId, tenantId, input) {
        const name = this.validateName(input.name);
        const headerKey = this.validateHeaderKey(input.header_key);
        const headerValue = this.validateHeaderValue(input.header_value);
        const badgeColor = this.validateColor(input.badge_color);
        const existing = await this.repo.find({ where: { agent_id: agentId } });
        this.assertNameAvailable(existing, name);
        this.assertRuleAvailable(existing, headerKey, headerValue);
        const nextOrder = existing.reduce((max, t) => (t.sort_order > max ? t.sort_order : max), -1) + 1;
        const now = new Date().toISOString();
        const record = Object.assign(new header_tier_entity_1.HeaderTier(), {
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenantId,
            agent_id: agentId,
            name,
            header_key: headerKey,
            header_value: headerValue,
            badge_color: badgeColor,
            sort_order: nextOrder,
            enabled: true,
            override_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
            created_at: now,
            updated_at: now,
        });
        await this.repo.insert(record);
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async update(agentId, id, patch) {
        const row = await this.findOrThrow(agentId, id);
        const siblings = (await this.repo.find({ where: { agent_id: agentId } })).filter((t) => t.id !== id);
        if (patch.name !== undefined) {
            const next = this.validateName(patch.name);
            this.assertNameAvailable(siblings, next);
            row.name = next;
        }
        if (patch.header_key !== undefined) {
            row.header_key = this.validateHeaderKey(patch.header_key);
        }
        if (patch.header_value !== undefined) {
            row.header_value = this.validateHeaderValue(patch.header_value);
        }
        if (patch.badge_color !== undefined) {
            row.badge_color = this.validateColor(patch.badge_color);
        }
        this.assertRuleAvailable(siblings, row.header_key, row.header_value);
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
        return row;
    }
    async setEnabled(agentId, id, enabled) {
        const row = await this.findOrThrow(agentId, id);
        row.enabled = enabled;
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
        return row;
    }
    async setResponseMode(agentId, id, responseMode) {
        const row = await this.findOrThrow(agentId, id);
        (0, response_mode_guard_1.assertStreamableResponseMode)(responseMode, `custom tier "${row.name}"`, row.override_route, row.fallback_routes);
        row.response_mode = responseMode;
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
        return row;
    }
    async delete(agentId, id) {
        const row = await this.findOrThrow(agentId, id);
        await this.repo.delete({ id: row.id });
        this.routingCache.invalidateAgent(agentId);
    }
    async reorder(agentId, ids) {
        if (!Array.isArray(ids)) {
            throw new common_1.BadRequestException('reorder: ids must be an array');
        }
        const rows = await this.repo.find({ where: { agent_id: agentId } });
        if (ids.length !== rows.length) {
            throw new common_1.BadRequestException('reorder list must include every existing tier exactly once');
        }
        if (new Set(ids).size !== ids.length) {
            throw new common_1.BadRequestException('reorder list must not contain duplicate ids');
        }
        const byId = new Map(rows.map((r) => [r.id, r]));
        if (!ids.every((id) => byId.has(id))) {
            throw new common_1.BadRequestException('reorder list must include every existing tier exactly once');
        }
        const now = new Date().toISOString();
        for (let i = 0; i < rows.length; i++) {
            const row = byId.get(ids[i]);
            row.sort_order = i;
            row.updated_at = now;
        }
        await this.repo.save([...byId.values()]);
        this.routingCache.invalidateAgent(agentId);
    }
    async setOverride(agentId, tenantId, id, model, provider, authType, providerKeyLabel) {
        const row = await this.findOrThrow(agentId, id);
        const resolution = (0, resolve_model_route_1.resolveModelRoute)(model, await this.discoveryService.getModelsForAgent(tenantId, row.agent_id), { provider, authType, keyLabel: providerKeyLabel });
        const route = resolution.ok
            ? resolution.route
            : (0, route_helpers_1.explicitRoute)(model, provider, authType, providerKeyLabel);
        (0, response_mode_guard_1.assertStreamableResponseMode)(row.response_mode, `custom tier "${row.name}"`, route, row.fallback_routes);
        row.override_route = route;
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
        return row;
    }
    async clearOverride(agentId, id) {
        const row = await this.findOrThrow(agentId, id);
        row.override_route = null;
        row.fallback_routes = null;
        (0, response_mode_guard_1.assertStreamableResponseMode)(row.response_mode, `custom tier "${row.name}"`, null, null);
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
    }
    async setFallbacks(agentId, tenantId, id, models, routes) {
        const row = await this.findOrThrow(agentId, id);
        const fallbackRoutes = await this.buildFallbackRoutes(row.agent_id, tenantId, models, routes, (0, route_helpers_1.readFallbackRoutes)(row));
        (0, response_mode_guard_1.assertStreamableResponseMode)(row.response_mode, `custom tier "${row.name}"`, row.override_route, fallbackRoutes);
        row.fallback_routes = fallbackRoutes;
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
        return row.fallback_routes ?? [];
    }
    async clearFallbacks(agentId, id) {
        const row = await this.findOrThrow(agentId, id);
        (0, response_mode_guard_1.assertStreamableResponseMode)(row.response_mode, `custom tier "${row.name}"`, row.override_route, null);
        row.fallback_routes = null;
        row.updated_at = new Date().toISOString();
        await this.repo.save(row);
        this.routingCache.invalidateAgent(agentId);
    }
    async buildFallbackRoutes(agentId, tenantId, models, routes, storedRoutes) {
        if (models.length === 0)
            return null;
        const available = await this.discoveryService.getModelsForAgent(tenantId, agentId);
        const resolution = (0, resolve_model_route_1.resolveFallbackRoutes)(models, available, routes, storedRoutes);
        if (!resolution.ok) {
            throw new common_1.BadRequestException((0, resolve_model_route_1.describeUnresolvedFallback)(resolution.model));
        }
        return resolution.routes;
    }
    async findOrThrow(agentId, id) {
        const row = await this.repo.findOne({ where: { id, agent_id: agentId } });
        if (!row)
            throw new common_1.NotFoundException('Header tier not found');
        return row;
    }
    validateName(raw) {
        const name = (raw ?? '').trim();
        if (!name)
            throw new common_1.BadRequestException('Name is required');
        if (name.length > MAX_NAME_LEN) {
            throw new common_1.BadRequestException(`Name must be ${MAX_NAME_LEN} characters or fewer`);
        }
        return name;
    }
    validateHeaderKey(raw) {
        const key = (raw ?? '').trim().toLowerCase();
        if (!key)
            throw new common_1.BadRequestException('Header key is required');
        if (!HEADER_KEY_RE.test(key)) {
            throw new common_1.BadRequestException(`Header keys can only contain lowercase letters, digits, and hyphens`);
        }
        if (exports.RESERVED_HEADER_KEYS.has(key)) {
            throw new common_1.BadRequestException(`This header is stripped for security and can't be used as a match rule`);
        }
        return key;
    }
    validateHeaderValue(raw) {
        const val = (raw ?? '').trim();
        if (!val)
            throw new common_1.BadRequestException('Header value is required');
        if (val.length > MAX_HEADER_VALUE_LEN) {
            throw new common_1.BadRequestException(`Header value must be ${MAX_HEADER_VALUE_LEN} characters or fewer`);
        }
        return val;
    }
    validateColor(raw) {
        if (!manifest_shared_1.TIER_COLORS.includes(raw)) {
            throw new common_1.BadRequestException(`Invalid badge color — pick one of ${manifest_shared_1.TIER_COLORS.join(', ')}`);
        }
        return raw;
    }
    assertNameAvailable(existing, name) {
        const lower = name.toLowerCase();
        if (existing.some((t) => t.name.toLowerCase() === lower)) {
            throw new common_1.BadRequestException('A tier with this name already exists');
        }
    }
    assertRuleAvailable(existing, key, value) {
        if (existing.some((t) => t.header_key === key && t.header_value === value)) {
            throw new common_1.BadRequestException('Another tier already matches this header key and value combination');
        }
    }
};
exports.HeaderTierService = HeaderTierService;
exports.HeaderTierService = HeaderTierService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(header_tier_entity_1.HeaderTier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService,
        model_discovery_service_1.ModelDiscoveryService])
], HeaderTierService);
//# sourceMappingURL=header-tier.service.js.map
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
var ProviderParamSpecService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderParamSpecService = void 0;
const node_fs_1 = require("node:fs");
const node_module_1 = require("node:module");
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const manifest_shared_1 = require("manifest-shared");
const MODELPARAMS_PACKAGE_JSON = 'modelparams/package.json';
const MODELPARAMS_DATA_RELATIVE_PATH = 'dist/generated/data.js';
const MODELPARAMS_API_DEFAULT_URL = 'https://modelparams.dev/api/v1/models.json';
const MODELPARAMS_API_TIMEOUT_MS = 10000;
const MODELPARAMS_API_MAX_BYTES = 16 * 1024 * 1024;
const SUBSCRIPTION_MODEL_SUFFIX = '-subscription';
const SHORT_CLAUDE_MODEL_RE = /^claude-(opus|sonnet|haiku)-/i;
const DOTTED_CLAUDE_MINOR_RE = /-(\d+)\.(\d{1,2})(?=$|-\d{8}$)/g;
const DATE_SUFFIX_RE = /-\d{4}-?\d{2}-?\d{2}$/;
const MODEL_PARAM_TYPES = [
    'boolean',
    'enum',
    'integer',
    'number',
    'string',
];
const MODEL_PARAM_GROUPS = [
    'generation_length',
    'sampling',
    'reasoning',
    'tooling',
    'output_format',
    'observability',
    'provider_metadata',
];
const API_LEVEL_PARAM_PATHS = new Set(['stream']);
const MOONSHOT_PARAM_MODEL_ALIASES = {
    k3: 'kimi-k3',
    'k3-256k': 'kimi-k3',
    'kimi-for-coding': 'kimi-k2.7-code',
    'kimi-for-coding-highspeed': 'kimi-k2.7-code-highspeed',
};
const requireFromThisModule = (0, node_module_1.createRequire)(__filename);
let ProviderParamSpecService = ProviderParamSpecService_1 = class ProviderParamSpecService {
    logger = new common_1.Logger(ProviderParamSpecService_1.name);
    specs = loadModelparamsCatalog();
    catalogEtag = null;
    refreshInFlight = null;
    onModuleInit() {
        void this.refreshCatalog();
    }
    async scheduledRefresh() {
        await this.refreshCatalog();
    }
    refreshCatalog() {
        if (process.env.MODELPARAMS_API_DISABLED === 'true')
            return Promise.resolve(false);
        if (this.refreshInFlight)
            return this.refreshInFlight;
        this.refreshInFlight = this.fetchAndSwapCatalog()
            .catch((err) => {
            this.logger.warn(`modelparams catalog refresh failed, keeping current catalog: ${err}`);
            return false;
        })
            .finally(() => {
            this.refreshInFlight = null;
        });
        return this.refreshInFlight;
    }
    async fetchAndSwapCatalog() {
        const url = process.env.MODELPARAMS_API_URL ?? MODELPARAMS_API_DEFAULT_URL;
        let response;
        try {
            response = await fetch(url, {
                headers: this.catalogEtag ? { 'if-none-match': this.catalogEtag } : undefined,
                signal: AbortSignal.timeout(MODELPARAMS_API_TIMEOUT_MS),
            });
        }
        catch (err) {
            this.logger.warn(`modelparams catalog fetch failed, keeping current catalog: ${err}`);
            return false;
        }
        if (response.status === 304)
            return false;
        if (!response.ok) {
            this.logger.warn(`modelparams catalog fetch returned ${response.status}, keeping current catalog`);
            return false;
        }
        if (Number(response.headers.get('content-length')) > MODELPARAMS_API_MAX_BYTES) {
            this.logger.warn(`modelparams catalog response declares more than ${MODELPARAMS_API_MAX_BYTES} bytes, keeping current catalog`);
            return false;
        }
        const body = await response.text();
        let raw;
        try {
            raw = JSON.parse(body);
        }
        catch {
            this.logger.warn('modelparams catalog response is not valid JSON, keeping current catalog');
            return false;
        }
        const catalog = parseModelParametersCatalog(raw);
        if (!catalog) {
            this.logger.warn('modelparams catalog response failed validation, keeping current catalog');
            return false;
        }
        this.specs = freezeCatalog(catalog);
        this.catalogEtag = response.headers.get('etag');
        this.logger.log(`modelparams catalog refreshed: ${catalog.length} entries`);
        return true;
    }
    async list() {
        return this.specs;
    }
    listModelIds() {
        return this.specs.map((entry) => {
            const provider = (0, manifest_shared_1.normalizeProviderParamProviderId)(entry.provider);
            return {
                provider,
                authType: entry.authType,
                model: entry.model,
            };
        });
    }
    async getSpecs(providerId, authType, model) {
        const providerlessSpecs = this.getProviderlessSpecs(this.specs, providerId, authType, model);
        if (providerlessSpecs.length > 0)
            return providerlessSpecs;
        const directSpecs = (0, manifest_shared_1.getProviderParamSpecs)(this.specs, providerId, authType, model);
        if (directSpecs.length > 0)
            return directSpecs;
        const metadata = providerMetadataIdentity(providerId, model);
        if (!metadata || metadataMatchesRoute(metadata, providerId, model))
            return directSpecs;
        return (0, manifest_shared_1.getProviderParamSpecs)(this.specs, metadata.provider, authType, metadata.model).map((spec) => withRouteIdentity(spec, providerId, authType, model));
    }
    async getCapabilities(providerId, authType, model) {
        const direct = (0, manifest_shared_1.getProviderModelCapabilities)(this.specs, providerId, authType, model);
        if (direct)
            return direct;
        const metadata = providerMetadataIdentity(providerId, model);
        if (!metadata || metadataMatchesRoute(metadata, providerId, model))
            return direct;
        return (0, manifest_shared_1.getProviderModelCapabilities)(this.specs, metadata.provider, authType, metadata.model);
    }
    getProviderlessSpecs(specs, providerId, authType, model) {
        if (!providerId || !authType || !model || authType === 'local')
            return [];
        const provider = (0, manifest_shared_1.normalizeProviderParamProviderId)(providerId);
        const metadata = resolveParamMetadataIdentity(provider, model);
        const lookupProvider = metadata.provider
            ? (0, manifest_shared_1.normalizeProviderParamProviderId)(metadata.provider)
            : provider;
        const candidates = providerlessModelParamCandidates(lookupProvider, authType, metadata.model);
        for (const candidate of candidates) {
            const entry = findProviderlessModelEntry(specs, lookupProvider, candidate);
            if (!entry || entry.params.length === 0)
                continue;
            return entry.params
                .map((param) => ({ provider, authType, model, ...param }))
                .sort(manifest_shared_1.compareProviderParamSpecs);
        }
        return [];
    }
};
exports.ProviderParamSpecService = ProviderParamSpecService;
__decorate([
    (0, schedule_1.Cron)('34 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderParamSpecService.prototype, "scheduledRefresh", null);
exports.ProviderParamSpecService = ProviderParamSpecService = ProviderParamSpecService_1 = __decorate([
    (0, common_1.Injectable)()
], ProviderParamSpecService);
function loadModelparamsCatalog() {
    const catalog = parseModelParametersCatalog({ models: loadModelparamsCatalogData() });
    if (!catalog)
        throw new Error('modelparams package returned an invalid MPS catalog');
    return freezeCatalog(catalog);
}
function loadModelparamsCatalogData() {
    const packageJsonPath = requireFromThisModule.resolve(MODELPARAMS_PACKAGE_JSON);
    const dataPath = (0, node_path_1.join)((0, node_path_1.dirname)(packageJsonPath), MODELPARAMS_DATA_RELATIVE_PATH);
    const dataModule = (0, node_fs_1.readFileSync)(dataPath, 'utf8');
    const match = dataModule.match(/export const CATALOG = ([\s\S]*?);\nfunction authSuffix/);
    if (!match)
        throw new Error('modelparams package catalog file has an unknown shape');
    return JSON.parse(match[1]);
}
function providerMetadataIdentity(providerId, model) {
    if (!model)
        return null;
    return resolveParamMetadataIdentity(providerId, model);
}
function resolveParamMetadataIdentity(providerId, model) {
    const normalizedProvider = providerId ? (0, manifest_shared_1.normalizeProviderParamProviderId)(providerId) : providerId;
    if (normalizedProvider === 'moonshot') {
        const catalogModel = MOONSHOT_PARAM_MODEL_ALIASES[model.toLowerCase()];
        if (catalogModel)
            return { provider: normalizedProvider, model: catalogModel };
    }
    return (0, manifest_shared_1.resolveProviderMetadataIdentity)(normalizedProvider, model);
}
function metadataMatchesRoute(metadata, providerId, model) {
    const normalizedProvider = providerId ? (0, manifest_shared_1.normalizeProviderParamProviderId)(providerId) : providerId;
    return metadata.provider === normalizedProvider && metadata.model === model;
}
function withRouteIdentity(spec, providerId, authType, model) {
    if (!providerId || !authType || !model)
        return spec;
    return {
        ...spec,
        provider: (0, manifest_shared_1.normalizeProviderParamProviderId)(providerId),
        authType,
        model,
    };
}
function providerlessModelParamCandidates(providerId, authType, model) {
    const out = [];
    for (const base of providerlessModelBaseCandidates(providerId, model)) {
        for (const variant of providerlessModelSlugVariants(base)) {
            if (authType === 'subscription') {
                pushUniqueCandidate(out, {
                    authType: 'subscription',
                    model: stripSubscriptionModelSuffix(variant),
                });
                if (!variant.endsWith(SUBSCRIPTION_MODEL_SUFFIX)) {
                    pushUniqueCandidate(out, { authType: 'api_key', model: variant });
                }
                continue;
            }
            pushUniqueCandidate(out, { authType, model: variant });
        }
    }
    return out;
}
function findProviderlessModelEntry(catalog, preferredProvider, candidate) {
    const normalizedProvider = (0, manifest_shared_1.normalizeProviderParamProviderId)(preferredProvider);
    return (catalog.find((entry) => (0, manifest_shared_1.normalizeProviderParamProviderId)(entry.provider) === normalizedProvider &&
        entry.authType === candidate.authType &&
        entry.model === candidate.model) ??
        catalog.find((entry) => entry.authType === candidate.authType && entry.model === candidate.model) ??
        null);
}
function providerlessModelBaseCandidates(providerId, model) {
    const out = [];
    const add = (candidate) => {
        if (!candidate)
            return;
        if (candidate.includes('/')) {
            const last = candidate.slice(candidate.lastIndexOf('/') + 1);
            pushUnique(out, last);
            return;
        }
        pushUnique(out, candidate);
    };
    add((0, manifest_shared_1.underlyingGatewayModel)(model));
    const normalizedProvider = providerId.toLowerCase();
    if (model.toLowerCase().startsWith(`${normalizedProvider}/`)) {
        add(model.slice(normalizedProvider.length + 1));
    }
    add(model);
    return out;
}
function providerlessModelSlugVariants(model) {
    const out = [];
    const stableModel = stripProviderlessDateSuffix(model);
    for (const candidate of [model, stableModel]) {
        const normalizedClaude = normalizeClaudeProviderlessSlug(candidate);
        pushUnique(out, normalizedClaude);
        pushUnique(out, candidate);
    }
    return out;
}
function normalizeClaudeProviderlessSlug(model) {
    if (!SHORT_CLAUDE_MODEL_RE.test(model))
        return model;
    return model.replace(DOTTED_CLAUDE_MINOR_RE, '-$1-$2');
}
function stripProviderlessDateSuffix(model) {
    return model.replace(DATE_SUFFIX_RE, '');
}
function stripSubscriptionModelSuffix(model) {
    if (!model.endsWith(SUBSCRIPTION_MODEL_SUFFIX))
        return model;
    return model.slice(0, -SUBSCRIPTION_MODEL_SUFFIX.length);
}
function pushUnique(values, value) {
    if (value && !values.includes(value))
        values.push(value);
}
function pushUniqueCandidate(values, value) {
    values.push(value);
}
function freezeCatalog(catalog) {
    return Object.freeze(catalog
        .filter((entry) => entry.params.length > 0 || (entry.capabilities?.length ?? 0) > 0)
        .map((entry) => Object.freeze({
        ...entry,
        ...(entry.capabilities ? { capabilities: Object.freeze([...entry.capabilities]) } : {}),
        params: Object.freeze([...entry.params].sort(manifest_shared_1.compareProviderParamSpecs)),
    }))
        .sort(compareProviderModelParamSpecs));
}
function parseModelParametersCatalog(raw) {
    if (!isRecord(raw))
        return null;
    const models = raw.models;
    if (!Array.isArray(models))
        return null;
    const catalog = [];
    for (const model of models) {
        const entry = parseProviderModelParamSpec(model);
        if (entry)
            catalog.push(entry);
    }
    return catalog.length > 0 ? catalog : null;
}
function parseProviderModelParamSpec(raw) {
    if (!isRecord(raw))
        return null;
    if (!isNonEmptyString(raw.provider))
        return null;
    if (!isAuthType(raw.authType))
        return null;
    if (!isNonEmptyString(raw.model))
        return null;
    if (raw.params !== undefined && !Array.isArray(raw.params))
        return null;
    const capabilities = raw.capabilities === undefined ? undefined : parseModelCapabilities(raw.capabilities);
    if (raw.capabilities !== undefined && !capabilities)
        return null;
    const rawParams = Array.isArray(raw.params) ? raw.params : [];
    const params = rawParams
        .map(parseModelParamDefinition)
        .filter((param) => param !== null);
    if (params.length === 0 && (!capabilities || capabilities.length === 0))
        return null;
    return {
        provider: raw.provider,
        authType: raw.authType,
        model: raw.model,
        ...(capabilities ? { capabilities } : {}),
        params,
    };
}
function parseModelCapabilities(raw) {
    if (!Array.isArray(raw))
        return null;
    const seen = new Set();
    const out = [];
    for (const value of raw) {
        if (!isModelCapability(value))
            return null;
        if (seen.has(value))
            continue;
        seen.add(value);
        out.push(value);
    }
    return out;
}
function parseModelParamDefinition(raw) {
    if (!isRecord(raw))
        return null;
    if (!isNonEmptyString(raw.path) || !(0, manifest_shared_1.isProviderParamPath)(raw.path))
        return null;
    if (API_LEVEL_PARAM_PATHS.has(raw.path))
        return null;
    if (!isModelParamType(raw.type))
        return null;
    if (!isNonEmptyString(raw.label))
        return null;
    if (!isNonEmptyString(raw.description))
        return null;
    if (!isModelParamGroup(raw.group))
        return null;
    const range = raw.range === undefined ? undefined : parseRange(raw.range);
    if (raw.range !== undefined && !range)
        return null;
    const values = raw.values === undefined ? undefined : parseJsonValues(raw.values);
    if (raw.values !== undefined && !values)
        return null;
    if (raw.type === 'enum' && (!values || values.length === 0))
        return null;
    const applicability = raw.applicability === undefined
        ? undefined
        : (0, manifest_shared_1.isParamApplicability)(raw.applicability)
            ? raw.applicability
            : null;
    if (raw.applicability !== undefined && !applicability)
        return null;
    const spec = {
        path: raw.path,
        type: raw.type,
        label: raw.label,
        description: raw.description,
        group: raw.group,
        ...(raw.default !== undefined ? { default: raw.default } : {}),
        ...(values ? { values } : {}),
        ...(range ? { range } : {}),
        ...(applicability ? { applicability } : {}),
    };
    if (raw.default !== undefined && !(0, manifest_shared_1.providerParamValueIsValid)(spec, raw.default))
        return null;
    return spec;
}
function parseRange(raw) {
    if (!isRecord(raw))
        return null;
    const range = {};
    if (raw.min !== undefined) {
        if (!isFiniteNumber(raw.min))
            return null;
        range.min = raw.min;
    }
    if (raw.max !== undefined) {
        if (!isFiniteNumber(raw.max))
            return null;
        range.max = raw.max;
    }
    if (raw.step !== undefined) {
        if (!isFiniteNumber(raw.step) || raw.step <= 0)
            return null;
        range.step = raw.step;
    }
    return range;
}
function parseJsonValues(raw) {
    if (!Array.isArray(raw))
        return null;
    if (raw.length === 0)
        return null;
    return raw.every(isJsonValue) ? raw : null;
}
function isModelParamType(value) {
    return typeof value === 'string' && MODEL_PARAM_TYPES.includes(value);
}
function isModelParamGroup(value) {
    return typeof value === 'string' && MODEL_PARAM_GROUPS.includes(value);
}
function isAuthType(value) {
    return typeof value === 'string' && manifest_shared_1.AUTH_TYPES.includes(value);
}
function isModelCapability(value) {
    return typeof value === 'string' && manifest_shared_1.MODEL_CAPABILITIES.includes(value);
}
function isJsonValue(value) {
    if (value === null)
        return true;
    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean')
        return true;
    if (Array.isArray(value))
        return value.every(isJsonValue);
    if (!isRecord(value))
        return false;
    return Object.values(value).every(isJsonValue);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function compareProviderModelParamSpecs(a, b) {
    const providerDelta = a.provider.localeCompare(b.provider);
    if (providerDelta !== 0)
        return providerDelta;
    const authDelta = a.authType.localeCompare(b.authType);
    if (authDelta !== 0)
        return authDelta;
    return a.model.localeCompare(b.model);
}
//# sourceMappingURL=provider-param-spec.service.js.map
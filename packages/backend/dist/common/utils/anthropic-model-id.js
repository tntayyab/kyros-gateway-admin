"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAnthropicShortModelId = normalizeAnthropicShortModelId;
exports.buildAnthropicShortModelIdVariants = buildAnthropicShortModelIdVariants;
exports.normalizeProviderModel = normalizeProviderModel;
const ANTHROPIC_PREFIX = 'anthropic/';
const SHORT_ANTHROPIC_MODEL_RE = /^claude-(opus|sonnet|haiku)-/i;
const DOTTED_MINOR_RE = /-(\d+)\.(\d{1,2})(?=$|-\d{8}$)/g;
const DASHED_MINOR_RE = /-(\d+)-(\d{1,2})(?=$|-\d{8}$)/g;
function splitAnthropicPrefix(model) {
    if (model.startsWith(ANTHROPIC_PREFIX)) {
        return {
            prefix: ANTHROPIC_PREFIX,
            bare: model.slice(ANTHROPIC_PREFIX.length),
        };
    }
    return { prefix: '', bare: model };
}
function supportsShortAnthropicMinorVersion(model) {
    return SHORT_ANTHROPIC_MODEL_RE.test(model);
}
function normalizeAnthropicShortModelId(model) {
    const { prefix, bare } = splitAnthropicPrefix(model);
    if (!supportsShortAnthropicMinorVersion(bare))
        return model;
    return `${prefix}${bare.replace(DOTTED_MINOR_RE, '-$1-$2')}`;
}
function buildAnthropicShortModelIdVariants(model) {
    const normalized = normalizeAnthropicShortModelId(model);
    const { prefix, bare } = splitAnthropicPrefix(normalized);
    if (!supportsShortAnthropicMinorVersion(bare))
        return [model];
    const variants = new Set([model, normalized]);
    variants.add(`${prefix}${bare.replace(DASHED_MINOR_RE, '-$1.$2')}`);
    return [...variants];
}
function normalizeProviderModel(provider, model) {
    return provider.toLowerCase() === 'anthropic' ? normalizeAnthropicShortModelId(model) : model;
}
//# sourceMappingURL=anthropic-model-id.js.map
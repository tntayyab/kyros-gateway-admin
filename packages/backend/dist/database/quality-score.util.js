"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUALITY_OVERRIDES = void 0;
exports.computeQualityScore = computeQualityScore;
exports.QUALITY_OVERRIDES = new Map([
    ['claude-sonnet-4-5-20250929', 4],
    ['claude-sonnet-4-20250514', 4],
    ['gpt-4o', 3],
    ['mistral-large-latest', 3],
    ['kimi-k2', 3],
    ['k3', 3],
    ['k3-256k', 3],
    ['openrouter/auto', 5],
    ['openrouter/free', 3],
]);
const MINI_VARIANT = /\b(mini|nano|haiku|micro)\b/i;
function computeQualityScore(model) {
    const override = exports.QUALITY_OVERRIDES.get(model.model_name);
    if (override !== undefined)
        return override;
    const slashIdx = model.model_name.indexOf('/');
    if (slashIdx > 0) {
        const bare = model.model_name.substring(slashIdx + 1);
        const bareOverride = exports.QUALITY_OVERRIDES.get(bare);
        if (bareOverride !== undefined)
            return bareOverride;
    }
    if (model.input_price_per_token == null || model.output_price_per_token == null)
        return 2;
    const totalPerM = (Number(model.input_price_per_token) + Number(model.output_price_per_token)) * 1_000_000;
    const hasReasoning = model.capability_reasoning;
    const hasCode = model.capability_code;
    const hasBoth = hasReasoning && hasCode;
    const bigContext = model.context_window >= 1_000_000;
    const nameForMatch = slashIdx > 0 ? model.model_name.substring(slashIdx + 1) : model.model_name;
    const isMini = MINI_VARIANT.test(nameForMatch);
    const hasCapabilities = hasReasoning === true || hasCode === true;
    if (totalPerM === 0) {
        if (hasBoth && !isMini)
            return 3;
        if (hasReasoning && !isMini)
            return 3;
        if (hasReasoning && isMini)
            return 2;
        if (hasCode)
            return 2;
        return 1;
    }
    if (hasCapabilities) {
        if (totalPerM >= 8.0 && hasBoth && !isMini)
            return 5;
        if (totalPerM >= 8.0 && hasCode && bigContext)
            return 5;
        if (totalPerM >= 1.0 && hasReasoning && !isMini)
            return 4;
        if (totalPerM >= 8.0 && hasCode)
            return 4;
        if (totalPerM >= 3.0 && hasCode && !isMini)
            return 3;
        if (totalPerM >= 0.5 && hasBoth && !isMini)
            return 3;
        if (hasReasoning && isMini && totalPerM >= 0.5)
            return 3;
        if (hasCode)
            return 2;
        return 1;
    }
    if (totalPerM >= 20.0 && !isMini)
        return 5;
    if (totalPerM >= 5.0 && !isMini)
        return 4;
    if (totalPerM >= 1.0 && !isMini)
        return 3;
    if (totalPerM >= 0.3)
        return 2;
    return 1;
}
//# sourceMappingURL=quality-score.util.js.map
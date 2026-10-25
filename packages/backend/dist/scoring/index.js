"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanMessages = exports.detectSpecificity = void 0;
exports.scoreRequest = scoreRequest;
exports.getDefaultConfig = getDefaultConfig;
const config_1 = require("./config");
const keyword_trie_1 = require("./keyword-trie");
const text_extractor_1 = require("./text-extractor");
const dimensions_1 = require("./dimensions");
const momentum_1 = require("./momentum");
const sigmoid_1 = require("./sigmoid");
const overrides_1 = require("./overrides");
var specificity_detector_1 = require("./specificity-detector");
Object.defineProperty(exports, "detectSpecificity", { enumerable: true, get: function () { return specificity_detector_1.detectSpecificity; } });
var scan_messages_1 = require("./scan-messages");
Object.defineProperty(exports, "scanMessages", { enumerable: true, get: function () { return scan_messages_1.scanMessages; } });
let defaultTrie = null;
function getDefaultTrie() {
    if (!defaultTrie) {
        defaultTrie = buildTrie(config_1.DEFAULT_CONFIG);
    }
    return defaultTrie;
}
function buildTrie(config) {
    const dims = config.dimensions
        .filter((d) => d.keywords && d.keywords.length > 0)
        .map((d) => ({ name: d.name, keywords: d.keywords }));
    return new keyword_trie_1.KeywordTrie(dims);
}
function mergeConfig(partial) {
    if (!partial)
        return config_1.DEFAULT_CONFIG;
    return { ...config_1.DEFAULT_CONFIG, ...partial };
}
const TIER_ORDER = {
    simple: 0,
    standard: 1,
    complex: 2,
    reasoning: 3,
};
function maxTier(a, b) {
    return TIER_ORDER[a] >= TIER_ORDER[b] ? a : b;
}
function emptyDimensions(config) {
    return config.dimensions.map((d) => ({
        name: d.name,
        rawScore: 0,
        weight: d.weight,
        weightedScore: 0,
        ...(d.keywords ? { matchedKeywords: [] } : {}),
    }));
}
const STRUCTURAL_SCORERS = new Map([
    ['tokenCount', (ctx) => (0, dimensions_1.scoreTokenCount)(ctx.combined)],
    ['nestedListDepth', (ctx) => (0, dimensions_1.scoreNestedListDepth)(ctx.combined)],
    ['conditionalLogic', (ctx) => (0, dimensions_1.scoreConditionalLogic)(ctx.combined)],
    ['codeToProse', (ctx) => (0, dimensions_1.scoreCodeToProse)(ctx.combined)],
    ['constraintDensity', (ctx) => (0, dimensions_1.scoreConstraintDensity)(ctx.combined)],
    ['expectedOutputLength', (ctx) => (0, dimensions_1.scoreExpectedOutputLength)(ctx.combined, ctx.maxTokens)],
    ['repetitionRequests', (ctx) => (0, dimensions_1.scoreRepetitionRequests)(ctx.combined)],
    ['toolCount', (ctx) => (0, dimensions_1.scoreToolCount)(ctx.tools, ctx.toolChoice)],
    ['conversationDepth', (ctx) => (0, dimensions_1.scoreConversationDepth)(ctx.conversationCount)],
]);
function scoreStructuralDimension(dim, ctx) {
    const scorer = STRUCTURAL_SCORERS.get(dim.name);
    return scorer ? scorer(ctx) : 0;
}
function scoreDimensions(config, allMatches, extracted, ctx) {
    const dimensions = [];
    let rawScore = 0;
    for (const dim of config.dimensions) {
        let dimRawScore;
        let matchedKeywords;
        if (dim.keywords && dim.keywords.length > 0) {
            const result = (0, dimensions_1.scoreKeywordDimension)(dim.name, allMatches, extracted, dim.direction);
            dimRawScore = result.rawScore;
            matchedKeywords = result.matchedKeywords;
        }
        else {
            dimRawScore = scoreStructuralDimension(dim, ctx);
        }
        const weightedScore = dimRawScore * dim.weight;
        rawScore += weightedScore;
        const entry = {
            name: dim.name,
            rawScore: dimRawScore,
            weight: dim.weight,
            weightedScore,
        };
        if (matchedKeywords !== undefined) {
            entry.matchedKeywords = matchedKeywords;
        }
        dimensions.push(entry);
    }
    return { dimensions, rawScore };
}
function scoreRequest(input, configOverride, momentum) {
    const config = mergeConfig(configOverride);
    const { messages, tools, tool_choice, max_tokens } = input;
    if (!messages || messages.length === 0) {
        return {
            tier: 'standard',
            score: 0,
            confidence: 0.4,
            reason: 'ambiguous',
            dimensions: emptyDimensions(config),
            momentum: null,
        };
    }
    const extracted = (0, text_extractor_1.extractUserTexts)(messages);
    const combined = (0, text_extractor_1.combinedText)(extracted);
    const lastUserText = extracted.length > 0 ? extracted[extracted.length - 1].text : '';
    const trie = configOverride ? buildTrie(config) : getDefaultTrie();
    if ((0, overrides_1.checkFormalLogicOverride)(config, lastUserText)) {
        return {
            tier: 'reasoning',
            score: 0.5,
            confidence: 0.95,
            reason: 'formal_logic_override',
            dimensions: emptyDimensions(config),
            momentum: null,
        };
    }
    const hasTools = tools && tools.length > 0;
    const hasMomentum = momentum?.recentTiers && momentum.recentTiers.length > 0;
    if (lastUserText.length > 0 && lastUserText.length < 50) {
        const lastMatches = trie.scan(lastUserText);
        const hasSimpleIndicator = lastMatches.some((m) => m.dimension === 'simpleIndicators');
        const hasComplexSignal = lastMatches.some((m) => m.dimension !== 'simpleIndicators' && m.dimension !== 'relay');
        if (!hasComplexSignal && (!hasMomentum || hasSimpleIndicator)) {
            return {
                tier: 'simple',
                score: -0.3,
                confidence: 0.9,
                reason: 'short_message',
                dimensions: emptyDimensions(config),
                momentum: null,
            };
        }
    }
    const allMatches = combined.length > 0 ? trie.scan(combined) : [];
    const conversationCount = (0, text_extractor_1.countConversationMessages)(messages);
    const ctx = {
        combined,
        maxTokens: max_tokens,
        tools,
        toolChoice: tool_choice,
        conversationCount,
    };
    const { dimensions, rawScore } = scoreDimensions(config, allMatches, extracted, ctx);
    const momentumResult = (0, momentum_1.applyMomentum)(rawScore, lastUserText.length, momentum);
    let { tier, reason } = applyTierFloors(momentumResult.effectiveScore, config, hasTools, tool_choice, messages, momentumResult.info.applied);
    const confidence = (0, sigmoid_1.computeConfidence)(momentumResult.effectiveScore, config.boundaries, config.confidenceK);
    if (confidence < config.confidenceThreshold && reason === 'scored') {
        tier = 'standard';
        reason = 'ambiguous';
    }
    return {
        tier,
        score: momentumResult.effectiveScore,
        confidence,
        reason,
        dimensions,
        momentum: momentum ? momentumResult.info : null,
    };
}
function applyTierFloors(effectiveScore, config, hasTools, toolChoice, messages, momentumApplied) {
    let tier = (0, sigmoid_1.scoreToTier)(effectiveScore, config.boundaries);
    let reason = 'scored';
    if (hasTools && toolChoice !== 'none') {
        const floored = maxTier(tier, 'standard');
        if (floored !== tier) {
            tier = floored;
            reason = 'tool_detected';
        }
    }
    if ((0, overrides_1.estimateTotalTokens)(messages) > 50_000) {
        const floored = maxTier(tier, 'complex');
        if (floored !== tier) {
            tier = floored;
            reason = 'large_context';
        }
    }
    if (momentumApplied)
        reason = 'momentum';
    return { tier, reason };
}
function getDefaultConfig() {
    return { ...config_1.DEFAULT_CONFIG };
}
//# sourceMappingURL=index.js.map
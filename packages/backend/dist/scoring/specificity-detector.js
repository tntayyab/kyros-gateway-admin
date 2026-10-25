"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSpecificity = detectSpecificity;
const types_1 = require("./types");
const manifest_shared_1 = require("manifest-shared");
const specificity_weights_1 = require("./specificity-weights");
const specificity_signals_1 = require("./specificity-signals");
const DIMENSION_MAP = {
    coding: ['codeGeneration', 'codeReview', 'technicalTerms', 'codeToProse'],
    web_browsing: ['webBrowsing'],
    data_analysis: ['domainSpecificity', 'dataAnalysis'],
    image_generation: ['imageGeneration'],
    video_generation: ['videoGeneration'],
    social_media: ['socialMedia'],
    email_management: ['emailManagement'],
    calendar_management: ['calendarManagement'],
    trading: ['trading'],
};
const TOOL_NAME_PATTERNS = {
    browser_: 'web_browsing',
    playwright_: 'web_browsing',
    web_: 'web_browsing',
    code_: 'coding',
    editor_: 'coding',
    image_: 'image_generation',
    midjourney_: 'image_generation',
    firefly_: 'image_generation',
    leonardo_: 'image_generation',
    video_: 'video_generation',
    runway_: 'video_generation',
    sora_: 'video_generation',
    social_: 'social_media',
    hootsuite_: 'social_media',
    buffer_: 'social_media',
    email_: 'email_management',
    gmail_: 'email_management',
    outlook_: 'email_management',
    superhuman_: 'email_management',
    calendar_: 'calendar_management',
    gcal_: 'calendar_management',
    calendly_: 'calendar_management',
    reclaim_: 'calendar_management',
    trade_: 'trading',
    exchange_: 'trading',
    robinhood_: 'trading',
    kalshi_: 'trading',
    coinbase_: 'trading',
};
const TOOL_MATCH_WEIGHT = 3;
const STICKY_AGREEMENT_MIN = 3;
const STICKY_HISTORY_WINDOW = 3;
const STICKY_BIAS = 2;
function detectSpecificity(allMatches, tools, headerOverride, thresholdOverride, text, recentCategories, categoryPenalties) {
    if (headerOverride && isValidCategory(headerOverride)) {
        return { category: headerOverride, confidence: 1.0 };
    }
    const scores = new Map();
    for (const cat of manifest_shared_1.SPECIFICITY_CATEGORIES)
        scores.set(cat, 0);
    const scoreOf = (cat) => scores.get(cat);
    for (const m of allMatches) {
        const cat = dimensionToCategory(m.dimension);
        if (!cat)
            continue;
        scores.set(cat, scoreOf(cat) + (0, specificity_weights_1.weightFor)(m.keyword));
    }
    if (tools && tools.length > 0) {
        applyToolHeuristics(tools, scores);
    }
    if (text && text.length > 0) {
        const { boosts } = (0, specificity_signals_1.computeSignalBoosts)(text, tools);
        for (const [cat, v] of boosts) {
            scores.set(cat, scoreOf(cat) + v);
        }
    }
    applySessionBias(scores, recentCategories);
    if (categoryPenalties) {
        for (const [cat, penalty] of categoryPenalties) {
            scores.set(cat, Math.max(0, scoreOf(cat) - penalty));
        }
    }
    let best = null;
    let bestScore = 0;
    for (const [cat, score] of scores) {
        const threshold = thresholdOverride ?? specificity_weights_1.ACTIVATION_THRESHOLDS[cat];
        if (score >= threshold && score > bestScore) {
            best = cat;
            bestScore = score;
        }
    }
    if (!best)
        return null;
    const categoryThreshold = thresholdOverride ?? specificity_weights_1.ACTIVATION_THRESHOLDS[best];
    const confidence = Math.min(bestScore / (categoryThreshold * 3), 1.0);
    return { category: best, confidence };
}
function dimensionToCategory(dimension) {
    for (const cat of manifest_shared_1.SPECIFICITY_CATEGORIES) {
        if (DIMENSION_MAP[cat].includes(dimension))
            return cat;
    }
    return null;
}
function applySessionBias(scores, recentCategories) {
    if (!recentCategories || recentCategories.length < STICKY_AGREEMENT_MIN)
        return;
    const window = recentCategories.slice(0, STICKY_HISTORY_WINDOW);
    const first = window[0];
    const allSame = window.every((c) => c === first);
    if (!allSame || window.length < STICKY_AGREEMENT_MIN)
        return;
    scores.set(first, scores.get(first) + STICKY_BIAS);
}
function applyToolHeuristics(tools, scores) {
    for (const tool of tools) {
        const name = (0, types_1.extractToolName)(tool);
        if (!name)
            continue;
        const lower = name.toLowerCase();
        for (const [prefix, category] of Object.entries(TOOL_NAME_PATTERNS)) {
            if (lower.startsWith(prefix)) {
                scores.set(category, scores.get(category) + TOOL_MATCH_WEIGHT);
                break;
            }
        }
    }
}
function isValidCategory(value) {
    return manifest_shared_1.SPECIFICITY_CATEGORIES.includes(value);
}
//# sourceMappingURL=specificity-detector.js.map
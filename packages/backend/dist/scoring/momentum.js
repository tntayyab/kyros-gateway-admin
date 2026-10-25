"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMomentum = applyMomentum;
const TIER_SCORES = {
    simple: -0.2,
    standard: 0.0,
    complex: 0.2,
    reasoning: 0.4,
};
const MAX_HISTORY = 5;
function applyMomentum(rawScore, lastUserMessageLength, momentum) {
    if (!momentum || !momentum.recentTiers || momentum.recentTiers.length === 0) {
        return {
            effectiveScore: rawScore,
            info: {
                historyLength: 0,
                historyAvgScore: 0,
                momentumWeight: 0,
                applied: false,
            },
        };
    }
    let momentumWeight;
    if (lastUserMessageLength > 100) {
        momentumWeight = 0;
    }
    else if (lastUserMessageLength >= 30) {
        momentumWeight = 0.3 * (1 - (lastUserMessageLength - 30) / 70);
    }
    else {
        momentumWeight = 0.3 + 0.3 * (1 - lastUserMessageLength / 30);
    }
    const recentSlice = momentum.recentTiers.slice(0, MAX_HISTORY);
    let historySum = 0;
    for (const tier of recentSlice) {
        historySum += TIER_SCORES[tier] ?? 0;
    }
    const historyAvg = historySum / recentSlice.length;
    const effectiveScore = (1 - momentumWeight) * rawScore + momentumWeight * historyAvg;
    return {
        effectiveScore,
        info: {
            historyLength: recentSlice.length,
            historyAvgScore: historyAvg,
            momentumWeight,
            applied: momentumWeight > 0 && effectiveScore !== rawScore,
        },
    };
}
//# sourceMappingURL=momentum.js.map
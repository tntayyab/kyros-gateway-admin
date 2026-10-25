"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreToTier = scoreToTier;
exports.computeConfidence = computeConfidence;
function scoreToTier(score, boundaries) {
    if (score < boundaries.simpleMax)
        return 'simple';
    if (score < boundaries.standardMax)
        return 'standard';
    if (score < boundaries.complexMax)
        return 'complex';
    return 'reasoning';
}
function computeConfidence(score, boundaries, k = 8) {
    const boundaryValues = [boundaries.simpleMax, boundaries.standardMax, boundaries.complexMax];
    let minDistance = Infinity;
    for (const b of boundaryValues) {
        const dist = Math.abs(score - b);
        if (dist < minDistance)
            minDistance = dist;
    }
    return 1 / (1 + Math.exp(-k * minDistance));
}
//# sourceMappingURL=sigmoid.js.map
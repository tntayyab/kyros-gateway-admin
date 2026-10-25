"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTokenCost = computeTokenCost;
function toUtcMinutes(time) {
    if (!time)
        return null;
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes))
        return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
        return null;
    return hours * 60 + minutes;
}
const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];
function weekMinutes(at) {
    const isoDay = (at.getUTCDay() + 6) % 7;
    return isoDay * MINUTES_PER_DAY + at.getUTCHours() * 60 + at.getUTCMinutes();
}
function tierCovers(tier, at) {
    const now = weekMinutes(at);
    const days = tier.days?.length ? tier.days : EVERY_DAY;
    for (const window of tier.windows) {
        const [start, end] = window.split('-').map(toUtcMinutes);
        if (start == null || end == null)
            continue;
        const length = (end - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;
        for (const day of days) {
            const opensAt = ((day - 1) * MINUTES_PER_DAY + start) % MINUTES_PER_WEEK;
            if ((now - opensAt + MINUTES_PER_WEEK) % MINUTES_PER_WEEK < length)
                return true;
        }
    }
    return false;
}
function resolveTimeTier(pricing, at) {
    const tiers = pricing.time_tiers;
    if (!tiers || tiers.length === 0)
        return undefined;
    return tiers.find((tier) => tierCovers(tier, at));
}
const MAX_RECORDABLE_COST_USD = 9999.999999;
function isRecordableReportedCost(reported) {
    return reported != null && reported >= 0 && reported <= MAX_RECORDABLE_COST_USD;
}
function computeTokenCost(input) {
    if (!input.model)
        return null;
    if (isRecordableReportedCost(input.reportedCostUsd)) {
        return input.reportedCostUsd;
    }
    if (input.isSubscription) {
        if (input.perRequestCostUsd != null && input.perRequestCostUsd > 0) {
            return input.perRequestCostUsd;
        }
        return 0;
    }
    if (input.isLocalProvider)
        return 0;
    if (input.inputTokens === 0 && input.outputTokens === 0)
        return null;
    const pricing = input.pricing;
    if (!pricing || pricing.input_price_per_token == null || pricing.output_price_per_token == null) {
        return null;
    }
    const timeTier = resolveTimeTier(pricing, input.at ?? new Date());
    const effective = timeTier != null &&
        timeTier.input_price_per_token != null &&
        timeTier.output_price_per_token != null
        ? timeTier
        : pricing;
    const inputPrice = Number(effective.input_price_per_token);
    const outputPrice = Number(effective.output_price_per_token);
    const cacheReadTokens = Math.min(input.inputTokens, Math.max(0, input.cacheReadTokens ?? 0));
    const cacheCreationTokens = Math.min(input.inputTokens - cacheReadTokens, Math.max(0, input.cacheCreationTokens ?? 0));
    const uncachedInputTokens = Math.max(0, input.inputTokens - cacheReadTokens - cacheCreationTokens);
    const cacheReadPrice = effective.cache_read_price_per_token != null
        ? Number(effective.cache_read_price_per_token)
        : inputPrice;
    const cacheWritePrice = effective.cache_write_price_per_token != null
        ? Number(effective.cache_write_price_per_token)
        : inputPrice;
    const cost = uncachedInputTokens * inputPrice +
        cacheReadTokens * cacheReadPrice +
        cacheCreationTokens * cacheWritePrice +
        input.outputTokens * outputPrice;
    return cost < 0 ? null : cost;
}
//# sourceMappingURL=cost-calculator.js.map
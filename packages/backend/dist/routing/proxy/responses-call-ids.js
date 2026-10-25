"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deduplicateCallIds = deduplicateCallIds;
function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function deduplicateCallIds(input) {
    const byCallId = new Map();
    const takenCallIds = new Set();
    input.forEach((item, index) => {
        if (!isRecord(item))
            return;
        const callId = typeof item.call_id === 'string' ? item.call_id : '';
        if (!callId)
            return;
        takenCallIds.add(callId);
        if (item.type !== 'function_call' && item.type !== 'function_call_output')
            return;
        const items = byCallId.get(callId) ?? [];
        items.push({ index, type: item.type });
        byCallId.set(callId, items);
    });
    const rewrites = new Map();
    for (const [callId, items] of byCallId) {
        if (items.length <= 2 || !isAlternatingPairs(items))
            continue;
        for (let pair = 1; pair * 2 < items.length; pair += 1) {
            const replacement = uniqueCallId(callId, pair, takenCallIds);
            rewrites.set(items[pair * 2].index, replacement);
            rewrites.set(items[pair * 2 + 1].index, replacement);
        }
    }
    if (rewrites.size === 0)
        return input;
    return input.map((item, index) => {
        const replacement = rewrites.get(index);
        return replacement === undefined ? item : { ...item, call_id: replacement };
    });
}
function isAlternatingPairs(items) {
    if (items.length % 2 !== 0)
        return false;
    return items.every((item, position) => position % 2 === 0 ? item.type === 'function_call' : item.type === 'function_call_output');
}
function uniqueCallId(callId, pair, taken) {
    let candidate = `${callId}-mnfst-${pair + 1}`;
    while (taken.has(candidate))
        candidate += '-x';
    taken.add(candidate);
    return candidate;
}
//# sourceMappingURL=responses-call-ids.js.map
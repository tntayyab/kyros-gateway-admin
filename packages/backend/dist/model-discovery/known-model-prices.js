"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupKnownPrice = lookupKnownPrice;
const PER_MILLION = 1_000_000;
const KNOWN_PRICES = [
    { prefix: 'moonshot-v1-', price: { input: 1.66 / PER_MILLION, output: 1.66 / PER_MILLION } },
    { prefix: 'gemma-3-1b-it', price: { input: 0, output: 0 } },
    { prefix: 'gemini-pro-latest', price: { input: 1.25 / PER_MILLION, output: 10.0 / PER_MILLION } },
];
function lookupKnownPrice(modelId) {
    for (const entry of KNOWN_PRICES) {
        if (modelId.startsWith(entry.prefix) || modelId === entry.prefix) {
            return entry.price;
        }
    }
    return null;
}
//# sourceMappingURL=known-model-prices.js.map
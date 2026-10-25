"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSubscriptionCredentialLock = mockSubscriptionCredentialLock;
function mockSubscriptionCredentialLock(provider) {
    return jest.fn(async (tenantId, providerId, label, fn) => fn({
        readFreshRaw: () => provider.getFreshSubscriptionCredential(tenantId, providerId, label),
        writeRaw: async (raw) => {
            await provider.upsertProvider(null, tenantId, providerId, raw, 'subscription', undefined, label);
        },
    }));
}
//# sourceMappingURL=mock-subscription-lock.js.map
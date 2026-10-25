"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStreamableResponseMode = assertStreamableResponseMode;
exports.effectiveRoutesForResponseMode = effectiveRoutesForResponseMode;
const common_1 = require("@nestjs/common");
const model_capabilities_1 = require("../../model-discovery/model-capabilities");
function assertStreamableResponseMode(responseMode, scopeLabel, primaryRoute, fallbackRoutes) {
    if (responseMode !== 'stream')
        return;
    const effective = effectiveRoutesForResponseMode(responseMode, primaryRoute, fallbackRoutes);
    if (effective.primaryRoute)
        return;
    throw new common_1.BadRequestException(`Cannot enable streaming for ${scopeLabel}: add at least one stream-capable model.`);
}
function effectiveRoutesForResponseMode(responseMode, primaryRoute, fallbackRoutes) {
    if (responseMode !== 'stream') {
        return {
            primaryRoute: primaryRoute ?? null,
            fallbackRoutes: fallbackRoutes ?? null,
        };
    }
    const streamableRoutes = [primaryRoute, ...(fallbackRoutes ?? [])].filter((route) => !!route && (0, model_capabilities_1.modelSupportsStreaming)(route.provider, route.model));
    return {
        primaryRoute: streamableRoutes[0] ?? null,
        fallbackRoutes: streamableRoutes.length > 1 ? streamableRoutes.slice(1) : null,
    };
}
//# sourceMappingURL=response-mode-guard.js.map
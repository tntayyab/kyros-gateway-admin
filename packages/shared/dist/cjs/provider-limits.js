"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_KEYS_PER_PROVIDER = void 0;
/**
 * Safety ceiling for active credentials on one provider/authentication type.
 *
 * This is intentionally high enough not to constrain legitimate multi-account
 * setups while still guarding against accidental bulk credential creation.
 */
exports.MAX_KEYS_PER_PROVIDER = 50;
//# sourceMappingURL=provider-limits.js.map
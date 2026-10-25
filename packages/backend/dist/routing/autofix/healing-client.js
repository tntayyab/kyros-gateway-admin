"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealContractError = exports.HEALING_CLIENT = void 0;
exports.HEALING_CLIENT = Symbol('HEALING_CLIENT');
class HealContractError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'HealContractError';
    }
}
exports.HealContractError = HealContractError;
//# sourceMappingURL=healing-client.js.map
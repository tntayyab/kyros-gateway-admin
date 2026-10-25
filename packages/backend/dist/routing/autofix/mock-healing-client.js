"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockHealingClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockHealingClient = exports.MOCK_RENAME_CATALOG = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
exports.MOCK_RENAME_CATALOG = {
    max_tokens: 'max_output_tokens',
};
let MockHealingClient = MockHealingClient_1 = class MockHealingClient {
    logger = new common_1.Logger(MockHealingClient_1.name);
    heal(input, _context) {
        const issueId = (0, uuid_1.v4)();
        const { code, param } = input.response.error;
        const rename = param && Object.hasOwn(exports.MOCK_RENAME_CATALOG, param) ? exports.MOCK_RENAME_CATALOG[param] : undefined;
        if (code === 'unknown_parameter' && param && rename && Object.hasOwn(input.request, param)) {
            const healedBody = { ...input.request };
            healedBody[rename] = healedBody[param];
            delete healedBody[param];
            this.logger.debug(`mock heal: rename_param ${param} -> ${rename}`);
            return Promise.resolve({
                status: 'unverified',
                issueId,
                patchId: (0, uuid_1.v4)(),
                healAttemptId: (0, uuid_1.v4)(),
                operations: [{ type: 'rename_param', from: param, to: rename }],
                healedBody,
            });
        }
        return Promise.resolve({ status: 'no_patch', issueId });
    }
    observe(observations, _context) {
        this.logger.log(`mock observe: ${observations.length} observation(s) discarded`);
        return Promise.resolve();
    }
    reportOutcome(healAttemptId, outcome, _context) {
        const succeeded = outcome.retryStatusCode < 400;
        return Promise.resolve({
            healAttemptId,
            status: succeeded ? 'succeeded' : 'failed',
            issueStatus: 'unverified',
        });
    }
};
exports.MockHealingClient = MockHealingClient;
exports.MockHealingClient = MockHealingClient = MockHealingClient_1 = __decorate([
    (0, common_1.Injectable)()
], MockHealingClient);
//# sourceMappingURL=mock-healing-client.js.map
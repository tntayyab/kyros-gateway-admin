"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DiscoverySyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoverySyncService = void 0;
const common_1 = require("@nestjs/common");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const DEFAULT_DISCOVERY_ENDPOINT = 'https://blue.manifest.build/v1/self-hosted/discovery';
const DISCOVERY_SYNC_TIMEOUT_MS = 10_000;
let DiscoverySyncService = DiscoverySyncService_1 = class DiscoverySyncService {
    logger = new common_1.Logger(DiscoverySyncService_1.name);
    async submit(submission) {
        if (!(0, detect_self_hosted_1.isSelfHosted)() || process.env['NODE_ENV'] !== 'production')
            return;
        if (!hasContent(submission))
            return;
        try {
            const endpoint = process.env['DISCOVERY_ENDPOINT']?.trim() || DEFAULT_DISCOVERY_ENDPOINT;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(submission),
                signal: AbortSignal.timeout(DISCOVERY_SYNC_TIMEOUT_MS),
            });
            if (!response.ok) {
                this.logger.warn(`Discovery sync returned ${response.status}`);
            }
        }
        catch (error) {
            this.logger.warn(`Discovery sync failed: ${String(error)}`);
        }
    }
};
exports.DiscoverySyncService = DiscoverySyncService;
exports.DiscoverySyncService = DiscoverySyncService = DiscoverySyncService_1 = __decorate([
    (0, common_1.Injectable)()
], DiscoverySyncService);
function hasContent(submission) {
    return Object.values(submission).some((value) => typeof value === 'string' && value.trim().length > 0);
}
//# sourceMappingURL=discovery-sync.service.js.map
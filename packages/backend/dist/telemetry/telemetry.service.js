"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TelemetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const install_id_service_1 = require("./install-id.service");
const payload_builder_service_1 = require("./payload-builder.service");
const telemetry_config_1 = require("./telemetry.config");
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
let TelemetryService = TelemetryService_1 = class TelemetryService {
    installIds;
    payloadBuilder;
    logger = new common_1.Logger(TelemetryService_1.name);
    config = (0, telemetry_config_1.buildTelemetryConfig)();
    constructor(installIds, payloadBuilder) {
        this.installIds = installIds;
        this.payloadBuilder = payloadBuilder;
    }
    async onModuleInit() {
        if (!this.config.enabled) {
            this.logger.log('Anonymous usage telemetry is disabled for this process.');
            return;
        }
        const install = await this.installIds.getOrCreate();
        this.logger.log(`Anonymous usage telemetry is enabled. Install ID: ${install.install_id}. ` +
            `To disable: set MANIFEST_TELEMETRY_DISABLED=1. What we send: ${telemetry_config_1.TELEMETRY_DOCS_URL}`);
    }
    async tick(now = new Date()) {
        if (!this.config.enabled)
            return;
        const install = await this.installIds.getOrCreate();
        if (!this.shouldSend(install.first_send_at, install.last_sent_at, now))
            return;
        const payload = await this.payloadBuilder.build(install.install_id, this.config.manifestVersion);
        const ok = await this.postPayload(payload);
        if (ok)
            await this.installIds.markSent(now);
    }
    shouldSend(firstSendAt, lastSentAt, now) {
        if (firstSendAt && new Date(firstSendAt).getTime() > now.getTime())
            return false;
        if (!lastSentAt)
            return true;
        return now.getTime() - new Date(lastSentAt).getTime() >= TWENTY_FOUR_HOURS_MS;
    }
    async postPayload(payload) {
        try {
            const res = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                this.logger.warn(`Telemetry endpoint returned ${res.status}`);
                return false;
            }
            return true;
        }
        catch (err) {
            this.logger.warn(`Telemetry send failed: ${err}`);
            return false;
        }
    }
};
exports.TelemetryService = TelemetryService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date]),
    __metadata("design:returntype", Promise)
], TelemetryService.prototype, "tick", null);
exports.TelemetryService = TelemetryService = TelemetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [install_id_service_1.InstallIdService,
        payload_builder_service_1.PayloadBuilderService])
], TelemetryService);
//# sourceMappingURL=telemetry.service.js.map
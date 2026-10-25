"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutofixModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const agent_entity_1 = require("../../entities/agent.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_entity_1 = require("../../entities/request.entity");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const telemetry_config_1 = require("../../telemetry/telemetry.config");
const telemetry_module_1 = require("../../telemetry/telemetry.module");
const autofix_service_1 = require("./autofix.service");
const autofix_health_probe_1 = require("./autofix-health-probe");
const autofix_healing_config_1 = require("./autofix-healing-config");
const healing_client_1 = require("./healing-client");
const http_healing_client_1 = require("./http-healing-client");
const install_id_service_1 = require("../../telemetry/install-id.service");
const mock_healing_client_1 = require("./mock-healing-client");
const observation_reporter_1 = require("./observation-reporter");
const DEFAULT_TIMEOUT_MS = 10_000;
let AutofixModule = class AutofixModule {
};
exports.AutofixModule = AutofixModule;
exports.AutofixModule = AutofixModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_entity_1.Agent, agent_message_entity_1.AgentMessage, request_entity_1.ManifestRequest]), telemetry_module_1.TelemetryModule],
        providers: [
            autofix_service_1.AutofixService,
            autofix_health_probe_1.AutofixHealthProbe,
            observation_reporter_1.ObservationReporter,
            {
                provide: healing_client_1.HEALING_CLIENT,
                useFactory: (config, installIds) => {
                    const nodeEnv = config.get('NODE_ENV');
                    const selfHosted = (0, detect_self_hosted_1.isSelfHosted)();
                    const url = (0, autofix_healing_config_1.resolveHealingUrl)(nodeEnv);
                    const rawTimeout = config.get('AUTOFIX_TIMEOUT_MS')?.trim() ?? '';
                    const parsed = /^\d+$/.test(rawTimeout) ? Number.parseInt(rawTimeout, 10) : NaN;
                    const timeoutMs = parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
                    if (url) {
                        const apiKey = config.get('AUTOFIX_HEALING_API_KEY')?.trim() || undefined;
                        const instanceId = !apiKey && selfHosted
                            ? (() => {
                                let cached = null;
                                return async () => {
                                    if (cached)
                                        return cached;
                                    cached = installIds.getOrCreate().then((i) => i.install_id);
                                    try {
                                        return await cached;
                                    }
                                    catch (err) {
                                        cached = null;
                                        throw err;
                                    }
                                };
                            })()
                            : undefined;
                        return new http_healing_client_1.HttpHealingClient(url, timeoutMs, apiKey, instanceId, (0, telemetry_config_1.readManifestVersion)());
                    }
                    return new mock_healing_client_1.MockHealingClient();
                },
                inject: [config_1.ConfigService, install_id_service_1.InstallIdService],
            },
        ],
        exports: [autofix_service_1.AutofixService, observation_reporter_1.ObservationReporter],
    })
], AutofixModule);
//# sourceMappingURL=autofix.module.js.map
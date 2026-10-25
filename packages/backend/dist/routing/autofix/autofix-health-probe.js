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
var AutofixHealthProbe_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutofixHealthProbe = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const autofix_healing_config_1 = require("./autofix-healing-config");
const PROBE_TIMEOUT_MS = 5_000;
let AutofixHealthProbe = AutofixHealthProbe_1 = class AutofixHealthProbe {
    config;
    logger = new common_1.Logger(AutofixHealthProbe_1.name);
    constructor(config) {
        this.config = config;
    }
    onApplicationBootstrap() {
        void this.probe();
    }
    async probe() {
        if (this.config.get('AUTOFIX_GLOBAL_ENABLED') === 'false')
            return;
        const url = (0, autofix_healing_config_1.resolveHealingUrl)(this.config.get('NODE_ENV'));
        if (!url)
            return;
        const target = `${url.replace(/\/+$/, '')}/api/health`;
        try {
            const res = await fetch(target, {
                signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
            });
            if (!res.ok) {
                this.logger.warn(`Autofix: Phoenix health probe ${target} returned ${res.status} — ` +
                    `Autofix will not heal until this is resolved.`);
                return;
            }
            this.logger.log(`Autofix: Phoenix healer reachable at ${url}.`);
        }
        catch (err) {
            this.logger.warn(`Autofix: Phoenix health probe ${target} failed (${err.message}) — ` +
                `check this host's outbound network access.`);
        }
    }
};
exports.AutofixHealthProbe = AutofixHealthProbe;
exports.AutofixHealthProbe = AutofixHealthProbe = AutofixHealthProbe_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AutofixHealthProbe);
//# sourceMappingURL=autofix-health-probe.js.map
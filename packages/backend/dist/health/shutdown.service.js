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
var ShutdownService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShutdownService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ShutdownService = ShutdownService_1 = class ShutdownService {
    config;
    logger = new common_1.Logger(ShutdownService_1.name);
    shuttingDown = false;
    constructor(config) {
        this.config = config;
    }
    isShuttingDown() {
        return this.shuttingDown;
    }
    async beforeApplicationShutdown(signal) {
        this.shuttingDown = true;
        const drainMs = this.config.get('app.shutdownDrainMs') ?? 0;
        const isProduction = this.config.get('app.nodeEnv') === 'production';
        if (!signal || !isProduction || drainMs <= 0) {
            return;
        }
        this.logger.log(`Received ${signal} — draining for ${drainMs}ms before closing connections.`);
        await new Promise((resolve) => setTimeout(resolve, drainMs));
    }
};
exports.ShutdownService = ShutdownService;
exports.ShutdownService = ShutdownService = ShutdownService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShutdownService);
//# sourceMappingURL=shutdown.service.js.map
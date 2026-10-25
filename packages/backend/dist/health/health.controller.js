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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const shutdown_service_1 = require("./shutdown.service");
let HealthController = class HealthController {
    shutdown;
    startTime = Date.now();
    constructor(shutdown) {
        this.shutdown = shutdown;
    }
    getHealth() {
        const uptime_seconds = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.shutdown.isShuttingDown()) {
            throw new common_1.ServiceUnavailableException({ status: 'shutting_down', uptime_seconds });
        }
        return { status: 'healthy', uptime_seconds };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [shutdown_service_1.ShutdownService])
], HealthController);
//# sourceMappingURL=health.controller.js.map
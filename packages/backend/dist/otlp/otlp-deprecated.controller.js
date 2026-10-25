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
exports.OtlpDeprecatedController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const GONE_RESPONSE = {
    error: {
        message: 'OTLP telemetry endpoints have been removed. ' +
            'Use the routing proxy at /v1/chat/completions instead.',
        type: 'gone',
        status: 410,
    },
};
const WRONG_PATH_RESPONSE = {
    error: {
        message: 'Use /v1/chat/completions (not /chat/completions). ' +
            'Set your baseURL to https://app.manifest.build/v1',
        type: 'invalid_request_error',
        status: 404,
    },
};
let OtlpDeprecatedController = class OtlpDeprecatedController {
    traces() {
        return GONE_RESPONSE;
    }
    metrics() {
        return GONE_RESPONSE;
    }
    logs() {
        return GONE_RESPONSE;
    }
    misroutedTraces() {
        return GONE_RESPONSE;
    }
    misroutedMetrics() {
        return GONE_RESPONSE;
    }
    misroutedLogs() {
        return GONE_RESPONSE;
    }
    strippedMetrics() {
        return GONE_RESPONSE;
    }
    strippedTraces() {
        return GONE_RESPONSE;
    }
    strippedLogs() {
        return GONE_RESPONSE;
    }
    wrongChatPath() {
        return WRONG_PATH_RESPONSE;
    }
};
exports.OtlpDeprecatedController = OtlpDeprecatedController;
__decorate([
    (0, common_1.All)('otlp/v1/traces'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "traces", null);
__decorate([
    (0, common_1.All)('otlp/v1/metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "metrics", null);
__decorate([
    (0, common_1.All)('otlp/v1/logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "logs", null);
__decorate([
    (0, common_1.All)('api/v1/otlp/v1/traces'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "misroutedTraces", null);
__decorate([
    (0, common_1.All)('api/v1/otlp/v1/metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "misroutedMetrics", null);
__decorate([
    (0, common_1.All)('api/v1/otlp/v1/logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "misroutedLogs", null);
__decorate([
    (0, common_1.All)('v1/metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "strippedMetrics", null);
__decorate([
    (0, common_1.All)('v1/traces'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "strippedTraces", null);
__decorate([
    (0, common_1.All)('v1/logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "strippedLogs", null);
__decorate([
    (0, common_1.Post)('chat/completions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NOT_FOUND),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtlpDeprecatedController.prototype, "wrongChatPath", null);
exports.OtlpDeprecatedController = OtlpDeprecatedController = __decorate([
    (0, common_1.Controller)(),
    (0, public_decorator_1.Public)()
], OtlpDeprecatedController);
//# sourceMappingURL=otlp-deprecated.controller.js.map
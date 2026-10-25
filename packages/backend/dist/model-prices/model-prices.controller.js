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
exports.ModelPricesController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const model_prices_service_1 = require("./model-prices.service");
const cache_constants_1 = require("../common/constants/cache.constants");
let ModelPricesController = class ModelPricesController {
    modelPricesService;
    constructor(modelPricesService) {
        this.modelPricesService = modelPricesService;
    }
    async getModelPrices() {
        return this.modelPricesService.getAll();
    }
};
exports.ModelPricesController = ModelPricesController;
__decorate([
    (0, common_1.Get)('model-prices'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.MODEL_PRICES_CACHE_TTL_MS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelPricesController.prototype, "getModelPrices", null);
exports.ModelPricesController = ModelPricesController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [model_prices_service_1.ModelPricesService])
], ModelPricesController);
//# sourceMappingURL=model-prices.controller.js.map
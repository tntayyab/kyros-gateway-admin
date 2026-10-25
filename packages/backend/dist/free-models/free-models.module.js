"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeModelsModule = void 0;
const common_1 = require("@nestjs/common");
const free_models_controller_1 = require("./free-models.controller");
const free_models_service_1 = require("./free-models.service");
const free_models_sync_service_1 = require("./free-models-sync.service");
let FreeModelsModule = class FreeModelsModule {
};
exports.FreeModelsModule = FreeModelsModule;
exports.FreeModelsModule = FreeModelsModule = __decorate([
    (0, common_1.Module)({
        controllers: [free_models_controller_1.FreeModelsController],
        providers: [free_models_service_1.FreeModelsService, free_models_sync_service_1.FreeModelsSyncService],
        exports: [free_models_sync_service_1.FreeModelsSyncService, free_models_service_1.FreeModelsService],
    })
], FreeModelsModule);
//# sourceMappingURL=free-models.module.js.map
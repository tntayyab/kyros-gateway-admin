"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionModule = void 0;
const common_1 = require("@nestjs/common");
const version_check_config_1 = require("./version-check.config");
const version_check_service_1 = require("./version-check.service");
const version_controller_1 = require("./version.controller");
let VersionModule = class VersionModule {
};
exports.VersionModule = VersionModule;
exports.VersionModule = VersionModule = __decorate([
    (0, common_1.Module)({
        controllers: [version_controller_1.VersionController],
        providers: [
            { provide: version_check_service_1.VERSION_CHECK_CONFIG, useFactory: version_check_config_1.buildVersionCheckConfig },
            version_check_service_1.VersionCheckService,
        ],
    })
], VersionModule);
//# sourceMappingURL=version.module.js.map
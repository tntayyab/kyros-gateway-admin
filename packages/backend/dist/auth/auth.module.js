"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const me_controller_1 = require("./me.controller");
const cli_auth_controller_1 = require("./cli-auth.controller");
const cli_auth_service_1 = require("./cli-auth.service");
const api_key_entity_1 = require("../entities/api-key.entity");
const cli_auth_code_entity_1 = require("../entities/cli-auth-code.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([api_key_entity_1.ApiKey, cli_auth_code_entity_1.CliAuthCode])],
        controllers: [me_controller_1.MeController, cli_auth_controller_1.CliAuthController],
        providers: [cli_auth_service_1.CliAuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map
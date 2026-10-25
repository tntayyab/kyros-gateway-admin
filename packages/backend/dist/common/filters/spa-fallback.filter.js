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
exports.SpaFallbackFilter = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const frontend_path_1 = require("../utils/frontend-path");
const og_rewrite_1 = require("../utils/og-rewrite");
const NON_SPA_PREFIXES = ['/api/', '/otlp/', '/v1/', '/assets/'];
let SpaFallbackFilter = class SpaFallbackFilter {
    indexContent;
    constructor(betterAuthUrl) {
        const frontendDir = (0, frontend_path_1.resolveFrontendDir)();
        const raw = frontendDir ? (0, fs_1.readFileSync)((0, path_1.join)(frontendDir, 'index.html'), 'utf-8') : null;
        const baseUrl = betterAuthUrl ?? process.env['BETTER_AUTH_URL'] ?? '';
        this.indexContent = raw ? (0, og_rewrite_1.rewriteOgTags)(raw, baseUrl) : null;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        if (req.method !== 'GET' ||
            !this.indexContent ||
            NON_SPA_PREFIXES.some((p) => req.originalUrl.startsWith(p))) {
            const response = exception.getResponse();
            const status = exception.getStatus();
            res.status(status).json(response);
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(this.indexContent);
    }
};
exports.SpaFallbackFilter = SpaFallbackFilter;
exports.SpaFallbackFilter = SpaFallbackFilter = __decorate([
    (0, common_1.Catch)(common_1.NotFoundException),
    __metadata("design:paramtypes", [String])
], SpaFallbackFilter);
//# sourceMappingURL=spa-fallback.filter.js.map
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
exports.GithubController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const GITHUB_REPO = 'mnfst/llm-gateway';
const CACHE_TTL_MS = 10 * 60 * 1000;
let cachedStars = null;
let cachedAt = 0;
let GithubController = class GithubController {
    async getStars() {
        if (cachedStars !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
            return { stars: cachedStars };
        }
        try {
            const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
                headers: { Accept: 'application/vnd.github.v3+json' },
            });
            if (!res.ok) {
                return { stars: cachedStars };
            }
            const data = (await res.json());
            if (typeof data.stargazers_count === 'number') {
                cachedStars = data.stargazers_count;
                cachedAt = Date.now();
            }
        }
        catch {
        }
        return { stars: cachedStars };
    }
};
exports.GithubController = GithubController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('github/stars'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getStars", null);
exports.GithubController = GithubController = __decorate([
    (0, common_1.Controller)('api/v1')
], GithubController);
//# sourceMappingURL=github.controller.js.map
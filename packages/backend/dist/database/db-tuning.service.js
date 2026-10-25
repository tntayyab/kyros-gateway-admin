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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DbTuningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbTuningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
let DbTuningService = class DbTuningService {
    static { DbTuningService_1 = this; }
    dataSource;
    config;
    logger = new common_1.Logger(DbTuningService_1.name);
    static SETTINGS = [
        { param: 'jit', value: 'off' },
        { param: 'work_mem', value: "'24MB'" },
        { param: 'random_page_cost', value: '1.1' },
    ];
    constructor(dataSource, config) {
        this.dataSource = dataSource;
        this.config = config;
    }
    async onApplicationBootstrap() {
        if (this.config.get('app.dbTuneSession') === false) {
            this.logger.log('Session planner tuning skipped (DB_TUNE_SESSION=false)');
            return;
        }
        await this.apply();
    }
    async apply() {
        let applied = 0;
        for (const { param, value } of DbTuningService_1.SETTINGS) {
            try {
                await this.dataSource.query(`ALTER ROLE CURRENT_USER SET ${param} = ${value}`);
                applied++;
            }
            catch (err) {
                this.logger.warn(`Could not set role default ${param}=${value} (continuing): ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        const total = DbTuningService_1.SETTINGS.length;
        if (applied === total) {
            this.logger.log('Applied session planner defaults (jit/work_mem/random_page_cost)');
        }
        else if (applied > 0) {
            this.logger.warn(`Applied ${applied}/${total} session planner defaults; the rest failed (see warnings above)`);
        }
        else {
            this.logger.warn('Could not apply any session planner defaults (see warnings above)');
        }
    }
};
exports.DbTuningService = DbTuningService;
exports.DbTuningService = DbTuningService = DbTuningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        config_1.ConfigService])
], DbTuningService);
//# sourceMappingURL=db-tuning.service.js.map
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
var MessageProviderBackfillBootService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageProviderBackfillBootService = exports.MESSAGE_PROVIDER_BACKFILL_LOCK_KEY = exports.MESSAGE_PROVIDER_BACKFILL_NAME = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const backfill_state_entity_1 = require("../../entities/backfill-state.entity");
const backfill_message_providers_1 = require("./backfill-message-providers");
const backfill_message_providers_gateway_1 = require("./backfill-message-providers.gateway");
exports.MESSAGE_PROVIDER_BACKFILL_NAME = 'agent_message_provider_attribution';
exports.MESSAGE_PROVIDER_BACKFILL_LOCK_KEY = 1792000000;
const LOCK_RETRY_MS = 30_000;
const wait = (ms) => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    if (typeof timer === 'object' && 'unref' in timer)
        timer.unref();
});
const defaultRunner = (dataSource, options) => (0, backfill_message_providers_1.runMessageProviderBackfill)(new backfill_message_providers_gateway_1.TypeOrmBackfillGateway(dataSource), options);
let MessageProviderBackfillBootService = MessageProviderBackfillBootService_1 = class MessageProviderBackfillBootService {
    dataSource;
    stateRepo;
    logger = new common_1.Logger(MessageProviderBackfillBootService_1.name);
    constructor(dataSource, stateRepo) {
        this.dataSource = dataSource;
        this.stateRepo = stateRepo;
    }
    onApplicationBootstrap() {
        if (process.env['NODE_ENV'] !== 'production' || !(0, detect_self_hosted_1.isSelfHosted)()) {
            return;
        }
        void this.runUntilComplete().catch((error) => {
            this.logger.error(`post-deploy backfill failed: ${error instanceof Error ? error.message : String(error)}`);
        });
    }
    async runUntilComplete() {
        while (!(await this.runOnce())) {
            await wait(LOCK_RETRY_MS);
        }
    }
    async runOnce(runner = defaultRunner) {
        if (await this.isCompleted()) {
            return true;
        }
        const lock = this.dataSource.createQueryRunner();
        await lock.connect();
        let acquired = false;
        try {
            const rows = (await lock.query('SELECT pg_try_advisory_lock($1) AS locked', [
                exports.MESSAGE_PROVIDER_BACKFILL_LOCK_KEY,
            ]));
            acquired = rows[0]?.locked === true;
            if (!acquired) {
                this.logger.log('another backfill is running; retrying provider attribution later');
                return false;
            }
            if (await this.isCompleted()) {
                return true;
            }
            this.logger.log('running post-deploy agent-message attribution backfill…');
            const result = await runner(this.dataSource, { logger: this.logger });
            await this.markCompleted();
            this.logger.log(`post-deploy backfill complete: stamped ${result.stamped} message(s) across ${result.windows} window(s)`);
            return true;
        }
        finally {
            if (acquired) {
                await lock
                    .query('SELECT pg_advisory_unlock($1)', [exports.MESSAGE_PROVIDER_BACKFILL_LOCK_KEY])
                    .catch(() => undefined);
            }
            await lock.release();
        }
    }
    async isCompleted() {
        return (await this.stateRepo.countBy({ name: exports.MESSAGE_PROVIDER_BACKFILL_NAME })) > 0;
    }
    async markCompleted() {
        await this.stateRepo
            .createQueryBuilder()
            .insert()
            .into(backfill_state_entity_1.BackfillState)
            .values({ name: exports.MESSAGE_PROVIDER_BACKFILL_NAME })
            .orIgnore()
            .execute();
    }
};
exports.MessageProviderBackfillBootService = MessageProviderBackfillBootService;
exports.MessageProviderBackfillBootService = MessageProviderBackfillBootService = MessageProviderBackfillBootService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(backfill_state_entity_1.BackfillState)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository])
], MessageProviderBackfillBootService);
//# sourceMappingURL=message-provider-backfill.boot.service.js.map
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
var RequestBackfillBootService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBackfillBootService = exports.REQUEST_BACKFILL_GENERIC_GRACE_MS = exports.REQUEST_BACKFILL_FALLBACK_GRACE_MS = exports.REQUEST_BACKFILL_TAIL_INTERVAL_MS = exports.REQUEST_BACKFILL_LOCK_RETRY_MS = exports.REQUEST_BACKFILL_LOCK_KEY = exports.REQUEST_TRANSITION_FINALIZATION_NAME = exports.REQUEST_BACKFILL_NAME = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const backfill_state_entity_1 = require("../../entities/backfill-state.entity");
const backfill_requests_1 = require("./backfill-requests");
const backfill_message_providers_1 = require("./backfill-message-providers");
const backfill_requests_gateway_1 = require("./backfill-requests.gateway");
const message_provider_backfill_boot_service_1 = require("./message-provider-backfill.boot.service");
const request_backfill_datasource_1 = require("./request-backfill.datasource");
exports.REQUEST_BACKFILL_NAME = 'requests_agent_messages_v1';
exports.REQUEST_TRANSITION_FINALIZATION_NAME = 'requests_agent_messages_v2';
exports.REQUEST_BACKFILL_LOCK_KEY = message_provider_backfill_boot_service_1.MESSAGE_PROVIDER_BACKFILL_LOCK_KEY;
const defaultRunner = (dataSource, logger, options) => (0, backfill_requests_1.runRequestBackfill)(new backfill_requests_gateway_1.TypeOrmRequestBackfillGateway(dataSource), { logger, ...options });
exports.REQUEST_BACKFILL_LOCK_RETRY_MS = 30_000;
exports.REQUEST_BACKFILL_TAIL_INTERVAL_MS = 60_000;
exports.REQUEST_BACKFILL_FALLBACK_GRACE_MS = 5 * 60_000;
exports.REQUEST_BACKFILL_GENERIC_GRACE_MS = 10 * 60_000;
const wait = (ms) => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    if (typeof timer === 'object' && 'unref' in timer)
        timer.unref();
});
const defaultTransitionFinalizer = async (dataSource, logger) => {
    const gateway = new backfill_requests_gateway_1.TypeOrmRequestBackfillGateway(dataSource);
    const rejections = await gateway.finalizeTransition(backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.batchSize, {
        lockTimeoutMs: backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.lockTimeoutMs,
        statementTimeoutMs: backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.statementTimeoutMs,
    }, (deleted) => logger.log(`request transition: removed ${deleted} staged rejection(s)`));
    return { rejections };
};
let RequestBackfillBootService = RequestBackfillBootService_1 = class RequestBackfillBootService {
    dataSource;
    stateRepo;
    logger = new common_1.Logger(RequestBackfillBootService_1.name);
    tailTimer;
    stopping = false;
    ownedDataSource;
    transitionReadyAt = Date.now() + exports.REQUEST_BACKFILL_GENERIC_GRACE_MS;
    constructor(dataSource, stateRepo) {
        this.dataSource = dataSource;
        this.stateRepo = stateRepo;
    }
    onApplicationBootstrap() {
        if (process.env['NODE_ENV'] !== 'production')
            return;
        this.stopping = false;
        void this.runManagedBackfill();
    }
    async onApplicationShutdown() {
        this.stopping = true;
        this.stopTailSweep();
        const ownedDataSource = this.ownedDataSource;
        this.ownedDataSource = undefined;
        if (ownedDataSource?.isInitialized)
            await ownedDataSource.destroy();
    }
    async runManagedBackfill() {
        while (!this.stopping) {
            try {
                const selfHosted = (0, detect_self_hosted_1.isSelfHosted)();
                const coordinator = selfHosted ? this : await this.createCloudCoordinator();
                if (!coordinator || this.stopping)
                    return;
                await coordinator.runUntilComplete();
                if (this.stopping)
                    return;
                if (selfHosted) {
                    await coordinator.startTailSweep();
                    return;
                }
                await this.releaseCloudCoordinator();
                return;
            }
            catch (error) {
                await this.releaseCloudCoordinator();
                if (this.stopping)
                    return;
                this.logger.error(`post-deploy request backfill failed: ${error instanceof Error ? error.message : String(error)}; retrying in ${exports.REQUEST_BACKFILL_LOCK_RETRY_MS / 1000}s`);
                await wait(exports.REQUEST_BACKFILL_LOCK_RETRY_MS);
            }
        }
    }
    async createCloudCoordinator() {
        const dataSource = (0, request_backfill_datasource_1.createRequestBackfillDataSource)(process.env);
        await dataSource.initialize();
        if (this.stopping) {
            await dataSource.destroy();
            return null;
        }
        this.ownedDataSource = dataSource;
        const stateRepo = dataSource.getRepository(backfill_state_entity_1.BackfillState);
        await new message_provider_backfill_boot_service_1.MessageProviderBackfillBootService(dataSource, stateRepo).runUntilComplete();
        return new RequestBackfillBootService_1(dataSource, stateRepo);
    }
    async releaseCloudCoordinator() {
        const dataSource = this.ownedDataSource;
        this.ownedDataSource = undefined;
        if (dataSource?.isInitialized)
            await dataSource.destroy().catch(() => undefined);
    }
    stopTailSweep() {
        if (this.tailTimer)
            clearInterval(this.tailTimer);
        this.tailTimer = undefined;
    }
    async runUntilComplete() {
        while (!(await this.runOnce())) {
            await wait(exports.REQUEST_BACKFILL_LOCK_RETRY_MS);
        }
    }
    async runOnce(runner = defaultRunner) {
        if (await this.isCompleted())
            return true;
        const lock = this.dataSource.createQueryRunner();
        await lock.connect();
        let acquired = false;
        try {
            const rows = (await lock.query('SELECT pg_try_advisory_lock($1) AS locked', [
                exports.REQUEST_BACKFILL_LOCK_KEY,
            ]));
            acquired = rows[0]?.locked === true;
            if (!acquired) {
                this.logger.log('another backfill is running; retrying request backfill later');
                return false;
            }
            if (await this.isCompleted())
                return true;
            this.logger.log('running post-deploy request/provider-attempt backfill…');
            const result = await runner(this.dataSource, this.logger, this.runOptions(true));
            await this.stateRepo
                .createQueryBuilder()
                .insert()
                .into(backfill_state_entity_1.BackfillState)
                .values({ name: exports.REQUEST_BACKFILL_NAME })
                .orIgnore()
                .execute();
            this.logger.log(`request backfill complete: ${result.attempts} attempt(s), ${result.rejections} rejection(s), ${result.windows} window(s)`);
            return true;
        }
        finally {
            if (acquired) {
                await lock
                    .query('SELECT pg_advisory_unlock($1)', [exports.REQUEST_BACKFILL_LOCK_KEY])
                    .catch(() => undefined);
            }
            await lock.release();
        }
    }
    async runTailOnce(runner = defaultRunner) {
        const options = this.runOptions(false);
        if (!(await this.hasEligibleAttempts(options.fallbackBefore)))
            return true;
        const lock = this.dataSource.createQueryRunner();
        await lock.connect();
        let acquired = false;
        try {
            const rows = (await lock.query('SELECT pg_try_advisory_lock($1) AS locked', [
                exports.REQUEST_BACKFILL_LOCK_KEY,
            ]));
            acquired = rows[0]?.locked === true;
            if (!acquired)
                return false;
            if (!(await this.hasEligibleAttempts(options.fallbackBefore)))
                return true;
            const result = await runner(this.dataSource, this.logger, options);
            this.logger.log(`request backfill tail sweep: ${result.attempts} attempt(s), ${result.rejections} rejection(s), ${result.windows} window(s)`);
            return true;
        }
        finally {
            if (acquired) {
                await lock
                    .query('SELECT pg_advisory_unlock($1)', [exports.REQUEST_BACKFILL_LOCK_KEY])
                    .catch(() => undefined);
            }
            await lock.release();
        }
    }
    async hasUnlinkedAttempts() {
        const rows = (await this.dataSource.query(`SELECT EXISTS (
         SELECT 1 FROM "agent_messages"
         WHERE "request_id" IS NULL
         LIMIT 1
       ) AS pending`));
        return rows[0]?.pending === true;
    }
    async startTailSweep() {
        if (!(await this.hasAttemptTable()))
            return;
        if (await this.isTransitionFinalized())
            return;
        this.tailTimer = setInterval(() => {
            void this.runMaintenanceOnce().catch((error) => {
                this.logger.error(`request backfill tail sweep failed: ${error instanceof Error ? error.message : String(error)}`);
            });
        }, exports.REQUEST_BACKFILL_TAIL_INTERVAL_MS);
        if (typeof this.tailTimer === 'object' && 'unref' in this.tailTimer)
            this.tailTimer.unref();
    }
    async runMaintenanceOnce() {
        if (!(await this.runTailOnce()))
            return;
        if (Date.now() < this.transitionReadyAt)
            return;
        if (await this.runTransitionFinalizeOnce())
            this.stopTailSweep();
    }
    async runTransitionFinalizeOnce(runner = defaultTransitionFinalizer) {
        if (await this.isTransitionFinalized())
            return true;
        if (await this.hasUnlinkedAttempts())
            return false;
        const lock = this.dataSource.createQueryRunner();
        await lock.connect();
        let acquired = false;
        try {
            const rows = (await lock.query('SELECT pg_try_advisory_lock($1) AS locked', [
                exports.REQUEST_BACKFILL_LOCK_KEY,
            ]));
            acquired = rows[0]?.locked === true;
            if (!acquired)
                return false;
            if (await this.isTransitionFinalized())
                return true;
            if (await this.hasUnlinkedAttempts())
                return false;
            const result = await runner(this.dataSource, this.logger);
            await this.stateRepo
                .createQueryBuilder()
                .insert()
                .into(backfill_state_entity_1.BackfillState)
                .values({ name: exports.REQUEST_TRANSITION_FINALIZATION_NAME })
                .orIgnore()
                .execute();
            this.logger.log(`request transition complete: removed ${result.rejections} staged rejection(s) and validated constraints`);
            return true;
        }
        finally {
            if (acquired) {
                await lock
                    .query('SELECT pg_advisory_unlock($1)', [exports.REQUEST_BACKFILL_LOCK_KEY])
                    .catch(() => undefined);
            }
            await lock.release();
        }
    }
    runOptions(initial) {
        const now = Date.now();
        return {
            analyze: initial,
            finalize: true,
            fallbackBefore: (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(now - exports.REQUEST_BACKFILL_FALLBACK_GRACE_MS)),
            before: (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(now - exports.REQUEST_BACKFILL_GENERIC_GRACE_MS)),
        };
    }
    async hasEligibleAttempts(before) {
        const rows = (await this.dataSource.query(`SELECT EXISTS (
         SELECT 1 FROM "agent_messages"
         WHERE "request_id" IS NULL AND timestamp < $1
         LIMIT 1
       ) AS pending`, [before]));
        return rows[0]?.pending === true;
    }
    async hasAttemptTable() {
        const rows = (await this.dataSource.query(`SELECT EXISTS (
         SELECT 1
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'
           AND c.relname = 'agent_messages'
           AND c.relkind IN ('r', 'p')
       ) AS present`));
        return rows[0]?.present === true;
    }
    async isCompleted() {
        return (await this.stateRepo.countBy({ name: exports.REQUEST_BACKFILL_NAME })) > 0;
    }
    async isTransitionFinalized() {
        return (await this.stateRepo.countBy({ name: exports.REQUEST_TRANSITION_FINALIZATION_NAME })) > 0;
    }
};
exports.RequestBackfillBootService = RequestBackfillBootService;
exports.RequestBackfillBootService = RequestBackfillBootService = RequestBackfillBootService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(backfill_state_entity_1.BackfillState)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository])
], RequestBackfillBootService);
//# sourceMappingURL=request-backfill.boot.service.js.map
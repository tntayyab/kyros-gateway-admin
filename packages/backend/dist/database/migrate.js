"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datasource_1 = __importDefault(require("./datasource"));
const run_migrations_with_lock_1 = require("./run-migrations-with-lock");
async function main() {
    await datasource_1.default.initialize();
    try {
        await (0, run_migrations_with_lock_1.runMigrationsWithAdvisoryLock)(datasource_1.default);
    }
    finally {
        await datasource_1.default.destroy();
    }
}
void main().then(() => process.exit(0), (err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map
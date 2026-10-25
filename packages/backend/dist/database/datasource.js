"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const data_source_definitions_1 = require("./data-source-definitions");
function createDataSource() {
    const databaseUrl = process.env['MIGRATION_DATABASE_URL'] ??
        process.env['DATABASE_UNPOOLED_URL'] ??
        process.env['DATABASE_URL'] ??
        'postgresql://myuser:mypassword@localhost:5432/mydatabase';
    return new typeorm_1.DataSource({
        type: 'postgres',
        url: databaseUrl,
        entities: data_source_definitions_1.entities,
        migrations: data_source_definitions_1.migrations,
    });
}
exports.default = createDataSource();
//# sourceMappingURL=datasource.js.map
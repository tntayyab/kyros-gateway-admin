"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneFactTableAutovacuum1802400000000 = void 0;
class TuneFactTableAutovacuum1802400000000 {
    name = 'TuneFactTableAutovacuum1802400000000';
    static SETTINGS = [
        [
            'requests',
            [
                'autovacuum_analyze_scale_factor = 0.01',
                'autovacuum_analyze_threshold = 5000',
                'autovacuum_vacuum_scale_factor = 0.02',
                'autovacuum_vacuum_threshold = 5000',
            ],
        ],
        [
            'agent_messages',
            ['autovacuum_analyze_threshold = 5000', 'autovacuum_vacuum_threshold = 5000'],
        ],
    ];
    async up(queryRunner) {
        for (const [table, settings] of TuneFactTableAutovacuum1802400000000.SETTINGS) {
            await queryRunner.query(`ALTER TABLE "${table}" SET (${settings.join(', ')})`);
        }
    }
    async down(queryRunner) {
        for (const [table, settings] of TuneFactTableAutovacuum1802400000000.SETTINGS) {
            const names = settings.map((s) => s.split(' = ')[0]);
            await queryRunner.query(`ALTER TABLE "${table}" RESET (${names.join(', ')})`);
        }
    }
}
exports.TuneFactTableAutovacuum1802400000000 = TuneFactTableAutovacuum1802400000000;
//# sourceMappingURL=1802400000000-TuneFactTableAutovacuum.js.map
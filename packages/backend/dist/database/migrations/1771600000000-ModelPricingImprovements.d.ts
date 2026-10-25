import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class ModelPricingImprovements1771600000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    private createModelPricingHistoryTable;
    private createUnresolvedModelsTable;
    private convertUpdatedAtToTimestamp;
    down(queryRunner: QueryRunner): Promise<void>;
}

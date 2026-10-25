import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddBillingEmailPreferences1798300000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

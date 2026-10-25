import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class MakeAutofixEnabledNullable1799000300000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

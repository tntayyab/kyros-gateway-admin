import { Repository } from 'typeorm';
import { PublicErrorPage } from '../entities/public-error-page.entity';
import { UpsertErrorPageDto } from './dto/upsert-error-page.dto';
export declare const MIN_TENANTS_FOR_PUBLIC = 10;
export declare class ErrorPagesService {
    private readonly repo;
    constructor(repo: Repository<PublicErrorPage>);
    listPublished(): Promise<PublicErrorPage[]>;
    getBySlug(slug: string): Promise<PublicErrorPage | null>;
    upsert(dto: UpsertErrorPageDto): Promise<{
        ok: true;
        slug: string;
    }>;
    remove(slug: string): Promise<{
        ok: true;
        slug: string;
    }>;
}

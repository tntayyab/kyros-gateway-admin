import { Repository } from 'typeorm';
import { InstallMetadata } from '../entities/install-metadata.entity';
export declare const SINGLETON_ID = "singleton";
export declare class InstallIdService {
    private readonly repo;
    constructor(repo: Repository<InstallMetadata>);
    getOrCreate(): Promise<InstallMetadata>;
    markSent(now: Date): Promise<void>;
    private computeFirstSendAt;
}

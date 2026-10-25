import { PlaygroundColumn } from './playground-column.entity';
export declare class PlaygroundRun {
    id: string;
    tenant_id: string;
    created_by_user_id: string | null;
    agent_id: string;
    agent_name: string;
    prompt: string;
    starred: boolean;
    best_column_id: string | null;
    created_at: string;
    columns: PlaygroundColumn[];
}

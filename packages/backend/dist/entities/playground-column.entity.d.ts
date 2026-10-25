import { PlaygroundRun } from './playground-run.entity';
export declare class PlaygroundColumn {
    id: string;
    playground_run_id: string;
    run: PlaygroundRun;
    model: string;
    provider: string;
    auth_type: string | null;
    display_name: string | null;
    status: string;
    content: string | null;
    headers: Record<string, string> | null;
    error_message: string | null;
    input_tokens: number | null;
    output_tokens: number | null;
    cost_usd: number | null;
    duration_ms: number | null;
    position: number;
    created_at: string;
}

import type { StoredAttemptRecording } from '../../routing/proxy/attempt-recording.types';
export declare function encodeRequestRecording(payload: StoredAttemptRecording): Promise<Buffer>;
export declare function decodeRequestRecording(body: Buffer): Promise<StoredAttemptRecording>;

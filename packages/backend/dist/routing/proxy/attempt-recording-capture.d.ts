import type { RecordingResponseBody, StoredAttemptRecording } from './attempt-recording.types';
export interface AttemptRecordingCapture {
    appendRaw(text: string): void;
    setJson(body: unknown): void;
    setRaw(text: string): void;
    buildResponseBody(): RecordingResponseBody | null;
    buildRecording(): StoredAttemptRecording;
}
export declare function recordingResponseFromText(raw: string): RecordingResponseBody;
export declare function createAttemptRecordingCapture(requestBody: Record<string, unknown>, wireFormat: string): AttemptRecordingCapture;

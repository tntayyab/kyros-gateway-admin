import type { IncomingHttpHeaders } from 'http';
export declare function sanitizeRequestHeaders(headers: IncomingHttpHeaders): Record<string, string> | null;

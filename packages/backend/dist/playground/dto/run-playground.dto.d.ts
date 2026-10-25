import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class PlaygroundMessageDto {
    role: string;
    content: string;
}
export declare class PlaygroundPayloadShapeConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean;
    defaultMessage(): string;
}
export declare class RunPlaygroundDto {
    agentName?: string;
    model: string;
    provider: string;
    authType?: 'api_key' | 'subscription' | 'local';
    messages?: PlaygroundMessageDto[];
    rawRequestBody?: Record<string, unknown>;
    runId?: string;
    position?: number;
    requestHeaders?: Record<string, string>;
}

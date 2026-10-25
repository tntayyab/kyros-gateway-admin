export declare function ok(payload: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function err(message: string): {
    content: {
        type: "text";
        text: string;
    }[];
    isError: true;
};
export declare function result(promise: Promise<unknown>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError: true;
}>;

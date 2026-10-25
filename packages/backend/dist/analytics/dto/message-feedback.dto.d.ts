export declare const FEEDBACK_RATINGS: readonly ["like", "dislike"];
export declare const FEEDBACK_TAGS: readonly ["Not expected tier", "Poor answer quality", "Too slow", "Buggy", "Other"];
export declare class MessageFeedbackDto {
    rating: 'like' | 'dislike';
    tags?: string[];
    details?: string;
}

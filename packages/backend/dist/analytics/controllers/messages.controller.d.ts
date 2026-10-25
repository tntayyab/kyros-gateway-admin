import { MessagesQueryDto } from '../dto/messages-query.dto';
import { MessageFeedbackDto } from '../dto/message-feedback.dto';
import { MessagesQueryService } from '../services/messages-query.service';
import { MessageDetailsService } from '../services/message-details.service';
import { MessageFeedbackService } from '../services/message-feedback.service';
import { SpecificityFeedbackService } from '../services/specificity-feedback.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
export declare class MessagesController {
    private readonly messagesQuery;
    private readonly messageDetails;
    private readonly messageFeedback;
    private readonly specificityFeedback;
    constructor(messagesQuery: MessagesQueryService, messageDetails: MessageDetailsService, messageFeedback: MessageFeedbackService, specificityFeedback: SpecificityFeedbackService);
    getMessages(query: MessagesQueryDto, ctx: TenantContext): Promise<{
        items: any[];
        next_cursor: string | null;
        total_count: number;
        total_count_exact: boolean;
        providers: string[];
        provider_labels: Record<string, string>;
        header_tiers: import("../services/messages-query.service").HeaderTierFilterOption[];
        models: string[];
    }>;
    getMessageFilterOptions(query: MessagesQueryDto, ctx: TenantContext): Promise<{
        providers: string[];
        provider_labels: Record<string, string>;
        header_tiers: import("../services/messages-query.service").HeaderTierFilterOption[];
        models: string[];
    }>;
    getMessageDetails(id: string, ctx: TenantContext): Promise<import("../services/message-details.service").MessageDetailResponse>;
    setFeedback(id: string, body: MessageFeedbackDto, ctx: TenantContext): Promise<void>;
    clearFeedback(id: string, ctx: TenantContext): Promise<void>;
    flagMiscategorized(id: string, ctx: TenantContext): Promise<void>;
    clearMiscategorized(id: string, ctx: TenantContext): Promise<void>;
}

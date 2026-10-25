import * as React from 'react';
export interface ThresholdAlertProps {
    agentName: string;
    metricType: 'tokens' | 'cost';
    threshold: number;
    actualValue: number;
    period: string;
    timestamp: string;
    agentUrl: string;
    logoUrl?: string;
    alertType?: 'soft' | 'hard';
    periodResetDate?: string;
}
export declare function ThresholdAlertEmail(props: ThresholdAlertProps): React.JSX.Element;

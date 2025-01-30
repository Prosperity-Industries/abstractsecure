interface ValidationError {
    field: string;
    message: string;
}
export declare const formatSSN: (ssn: string) => string;
export declare const validateSSN: (ssn: string) => boolean;
export declare const validateISODate: (date: string) => boolean;
export declare const validateWebhookPayload: (data: any) => ValidationError[];
export {};

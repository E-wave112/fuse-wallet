export type EmailOption = {
    recipients: any | any[];
    from?: string;
    subject?: string;
    templateId?: string;
    substitutions?: any;
};

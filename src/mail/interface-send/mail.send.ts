import { EmailOption } from '../types/mail.types';
export const mailStructure = (
    recipients: any | any[],
    from?: string,
    subject?: string,
    templateId?: string,
    substitutions?: any,
): EmailOption => {
    return {
        recipients,
        from,
        subject,
        templateId,
        substitutions,
    };
};

import { EmailOption } from '../types/mail.types';
/**
 * It takes in a recipient, and returns an object with the recipient, and other optional parameters
 * @param {any | any[]} recipients - This is the email address of the recipient. It can be a string or
 * an array of strings.
 * @param {string} [from] - The email address of the sender. All email addresses can be plain
 * 'sender@server.com' or formatted 'Sender Name <sender@server.com>'
 * @param {string} [subject] - The subject of the email.
 * @param {string} [templateId] - The ID of the template you want to use.
 * @param {any} [substitutions] - This is the data that will be used to replace the placeholders in the
 * template.
 * @returns An object with the following properties:
 * recipients: any | any[]
 * from?: string
 * subject?: string
 * templateId?: string
 * substitutions?: any
 */
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

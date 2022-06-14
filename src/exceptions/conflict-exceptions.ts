import { ConflictException } from '@nestjs/common';
export class DataConflictException extends ConflictException {
    constructor(error?: string) {
        super('', error);
    }
}

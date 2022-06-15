import { NotFoundException } from '@nestjs/common';

export class BeneficiaryNotFoundException extends NotFoundException {
    constructor(error?: string) {
        super('this user is not amongst your beneficiaries!', error);
    }
}

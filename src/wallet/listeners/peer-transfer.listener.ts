import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { transferWallet } from '../events/transfer-completed.events';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class PeerToPeerEventListener {
    constructor(private readonly mailService: MailService) {}
    @OnEvent('token.*')
    async handlePeerToPeerEvent(event: transferWallet) {
        // handle and process "handlePeerToPeerEvent" event
        const emailEvent = await this.mailService.send(event);
        return emailEvent;
    }
}

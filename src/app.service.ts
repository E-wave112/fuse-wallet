import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to bit wallets!, please go to this url https://documenter.getpostman.com/view/11690328/Uz5KkEQF to view our documentation';
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should return a welcome message', () => {
            expect(appController.getHello()).toBe(
                'Welcome to fuse wallets!, please go to this url https://documenter.getpostman.com/view/11690328/UzBiNnzU to view our documentation',
            );
        });
    });
});

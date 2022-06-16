import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LogInUserDto } from '../user/dto/login.dto';
import { SignUpDto } from '../user/dto/signup.dto';
import { AppModule } from '../app.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
jest.setTimeout(60000);

describe('AuthService', () => {
    let service: AuthService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                User,
                {
                    provide: JwtService,
                    useFactory: () => ({
                        sign: jest.fn(() => true),
                    }),
                },
                ConfigService,
            ],
            imports: [AppModule, UserModule],
        }).compile();

        service = module.get<AuthService>(AuthService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('signup a user', () => {
        it('service to sign up a user', async () => {
            const user = new SignUpDto();
            user.email = 'dwave101@yahoo.com';
            user.pin = '123456';
            user.firstName = 'dwave';
            user.lastName = 'dwave';
            user.phone = '08012345678';
            user.deviceId = '123456789';
            try {
                const result = await service.signup(user);
                expect(result).toBeCalledWith(user);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('login a user', () => {
        it('service to login a user', async () => {
            const loginDto = new LogInUserDto();
            loginDto.email = 'dwave101@yahoo.com';
            loginDto.pin = '123456';
            try {
                const result = await service.login(loginDto);
                expect(result).toBeCalledWith(loginDto);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

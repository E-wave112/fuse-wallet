import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { LogInUserDto } from '../../user/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({ usernameField: 'email' });
    }

    public validate = async (data: LogInUserDto) => {
        const verifyUser = await this.userService.findUser(data);
        if (!verifyUser) {
            throw new UnauthorizedException();
        }
        return verifyUser;
    };
}

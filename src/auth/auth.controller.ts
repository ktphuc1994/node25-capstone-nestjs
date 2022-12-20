import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  SerializeOptions,
} from '@nestjs/common';

// import guards
import { AuthGuard } from '@nestjs/passport';

// import local DTO
import { CreateNguoiDungDto, LoginInfoDto, ResSuccess } from '../dto/index.dto';

// import local service
import { AuthService } from './auth.service';

// import Swagger
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginInfoDto,
  ): Promise<ResSuccess<{ Authorization: string }>> {
    const user = await this.authService.validateUser(body);
    const Authorization = await this.authService.login(user);
    return {
      message: 'Login Successfull',
      content: { Authorization },
    };
  }

  @Post('register')
  async register(
    @Body() newUser: CreateNguoiDungDto,
  ): Promise<ResSuccess<string>> {
    return this.authService.register(newUser);
  }
}

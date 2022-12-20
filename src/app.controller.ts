import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  TestAPI() {
    throw new UnauthorizedException('Something bad happened', {
      cause: new Error(),
      description: 'Some error description',
    });
  }
}

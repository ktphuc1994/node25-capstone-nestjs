import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// import local service
import { UsersService } from '../users/users.service';

// import prisma
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
const prisma = new PrismaClient();

// import local DTO
import {
  CreateNguoiDungDto,
  LoginInfoDto,
  NguoiDungDto,
  ResSuccess,
} from '../dto/index.dto';

// import bcrypt
import * as bcrypt from 'bcrypt';
import { prismaErrorCodes } from '../errorCode/prismaErrorCode.enum';

// import error codes

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // USER VALIDATION - Is email and password correct
  async validateUser({ email, mat_khau }: LoginInfoDto): Promise<NguoiDungDto> {
    const user = await this.usersService.getUserByEmail(email);

    const checkPass = bcrypt.compareSync(mat_khau, user.mat_khau);
    if (checkPass) {
      const { mat_khau: password, is_removed, ...result } = user;
      return result;
    }

    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Incorrect Password',
      content: 'Login failed',
    });
  }

  // USER LOGIN - Create authtoken
  async login(user: NguoiDungDto): Promise<string> {
    return this.jwtService.sign(user);
  }

  // USER REGISTER - Check existance and Create new user
  async register(registerData: CreateNguoiDungDto): Promise<string> {
    try {
      const hashedPass = bcrypt.hashSync(
        registerData.mat_khau,
        Number(this.configService.get('BCRYPT_SALT')),
      );
      await this.usersService.create({
        ...registerData,
        mat_khau: hashedPass,
      });
      return 'User created successfully';
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === prismaErrorCodes.unique
      ) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email has already been existed.',
          error: err.meta ? err.meta : registerData,
        });
      }
      throw err;
    }
  }
}

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// import bcrypt
import bcrypt from 'bcrypt';

// import local DTO
import { CreateNguoiDungDto, LoaiNguoiDung } from './user-dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly config: ConfigService) {}

  // GET user information by Email
  async getUserByEmail(email: string) {
    const user = await prisma.nguoiDung.findFirst({
      where: { email, is_removed: false },
    });
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User with this email does not exist',
        content: { email },
      });
    }
    return user;
  }

  // Create new user
  async create(userData: CreateNguoiDungDto) {
    const newUser = await prisma.nguoiDung.create({ data: userData });
    return newUser;
  }

  // LẤY Danh Sách loại người dùng
  getUserRole() {
    return Object.values(LoaiNguoiDung);
  }
}

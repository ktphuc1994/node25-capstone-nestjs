import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { NguoiDung, PrismaClient, Prisma } from '@prisma/client';
import { userSelectNoPass } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import local DTO
import {
  CreateNguoiDungDto,
  LoaiNguoiDung,
  NguoiDungDto,
} from './user-dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly config: ConfigService) {}

  // GET user information by Email
  async getUserByEmail(email: string): Promise<NguoiDung> {
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

  // LẤY Danh Sách người dùng
  async getUserList(): Promise<NguoiDungDto[]> {
    return await prisma.nguoiDung.findMany({
      where: { is_removed: false },
      select: userSelectNoPass,
    });
  }

  // LẤY thông tin người dùng bằng ho_ten
  async getUsersByName(tuKhoa: string): Promise<NguoiDungDto[]> {
    return await prisma.nguoiDung.findMany({
      where: { ho_ten: { contains: tuKhoa }, is_removed: false },
      select: userSelectNoPass,
    });
  }

  // LẤY thông tin người dùng bằng ID
  async getUserInfoById(tai_khoan: number): Promise<NguoiDungDto> {
    return await prisma.nguoiDung.findFirst({
      where: { tai_khoan, is_removed: false },
      select: userSelectNoPass,
    });
  }

  // THÊM người dùng
  async addUser(newUser: Prisma.NguoiDungCreateInput): Promise<NguoiDungDto> {
    const user = await prisma.nguoiDung.create({ data: newUser });
    delete user.mat_khau;
    delete user.is_removed;
    return user;
  }
}

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { NguoiDung, PrismaClient, Prisma } from '@prisma/client';
import { userSelectNoPass } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import bcrypt
import * as bcrypt from 'bcrypt';

// import local DTO
import {
  CreateNguoiDungDto,
  LoaiNguoiDung,
  NguoiDungDto,
  UpdateNguoiDungDto,
  UpdateNguoiDungDtoAdmin,
} from './user-dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly configService: ConfigService) {}

  // GET user information by Email
  async getUserByEmail(email: string): Promise<NguoiDung> {
    const user = await prisma.nguoiDung.findFirst({
      where: { email, isRemoved: false },
    });
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User with this email does not exist',
        error: { email },
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
      where: { isRemoved: false },
      select: userSelectNoPass,
    });
  }

  // TÌM KIẾM danh sách người dùng bằng hoTen
  async getUsersByName(tuKhoa: string): Promise<NguoiDungDto[]> {
    return await prisma.nguoiDung.findMany({
      where: { hoTen: { contains: tuKhoa }, isRemoved: false },
      select: userSelectNoPass,
    });
  }

  // TÌM KIẾM danh sách người dùng bằng hoTen và phân trang
  async getUsersPagination(
    tuKhoa: string,
    soTrang: number,
    soPhanTuTrenTrang: number,
  ): Promise<NguoiDungDto[]> {
    return await prisma.nguoiDung.findMany({
      where: { hoTen: { contains: tuKhoa } },
      skip: (soTrang - 1) * soPhanTuTrenTrang,
      take: soPhanTuTrenTrang,
      select: userSelectNoPass,
    });
  }

  // LẤY thông tin người dùng bằng ID
  async getUserInfoById(taiKhoan: number): Promise<NguoiDungDto | null> {
    return await prisma.nguoiDung.findFirst({
      where: { taiKhoan, isRemoved: false },
      select: userSelectNoPass,
    });
  }

  // THÊM người dùng
  async addUser(newUser: Prisma.NguoiDungCreateInput): Promise<NguoiDungDto> {
    const user = await prisma.nguoiDung.create({ data: newUser });
    delete user.matKhau;
    delete user.isRemoved;
    return user;
  }

  // CẬP NHẬT Thông tin người dùng (user)
  async updateUser(
    updateUserInput: UpdateNguoiDungDto,
    taiKhoan: number,
  ): Promise<NguoiDungDto> {
    const { matKhauMoi, ...userInfo } = updateUserInput;
    userInfo.matKhau = bcrypt.hashSync(
      matKhauMoi,
      Number(this.configService.get('BCRYPT_SALT')),
    );
    const updatedUser = await prisma.nguoiDung.update({
      where: { taiKhoan },
      data: userInfo,
    });
    delete updatedUser.matKhau;
    delete updatedUser.isRemoved;
    return updatedUser;
  }

  // CẬP NHẬT Thông tin người dùng (admin)
  async updateUserAdmin(
    userInfo: UpdateNguoiDungDtoAdmin,
  ): Promise<NguoiDungDto> {
    userInfo.matKhau = bcrypt.hashSync(
      userInfo.matKhau,
      Number(this.configService.get('BCRYPT_SALT')),
    );
    const updatedUser = await prisma.nguoiDung.update({
      where: { taiKhoan: userInfo.taiKhoan },
      data: userInfo,
    });
    delete updatedUser.matKhau;
    delete updatedUser.isRemoved;
    return updatedUser;
  }

  // XÓA người dùng
  async deleteUser(taiKhoan: number) {
    await prisma.nguoiDung.delete({ where: { taiKhoan } });
    return 'Deleted user successfully';
  }
}

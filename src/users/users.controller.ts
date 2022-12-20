import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// import local service
import { UsersService } from './users.service';

@ApiTags('Quản lí người dùng')
@Controller('QuanLyNguoiDung')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('LayDanhSachLoaiNguoiDung')
  getUserRoles() {
    return { message: 'Success', content: this.usersService.getUserRole() };
  }
}

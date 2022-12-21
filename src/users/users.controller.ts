import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

// import local Type
import { RequestWithUser } from '../dto/common.dto';
import {
  AddNguoiDungDTO,
  LoaiNguoiDung,
  NguoiDungDto,
} from './user-dto/user.dto';

// import local service
import { UsersService } from './users.service';

@ApiTags('Quản lí người dùng')
@Controller('QuanLyNguoiDung')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('LayDanhSachLoaiNguoiDung')
  getUserRoles(): LoaiNguoiDung[] {
    return this.usersService.getUserRole();
  }

  @Get('LayDanhSachNguoiDung')
  async getUserList(): Promise<NguoiDungDto[]> {
    return await this.usersService.getUserList();
  }

  @Get('TimKiemNguoiDung')
  async getUserByName(
    @Query('tuKhoa') tuKhoa: string,
  ): Promise<NguoiDungDto[]> {
    console.log(tuKhoa);
    return await this.usersService.getUsersByName(tuKhoa);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
  @Get('ThongTinTaiKhoan')
  getUserInfo(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('LayThongTinNguoiDung/:taiKhoan')
  async getUserInfoById(
    @Param('taiKhoan', ParseIntPipe) tai_khoan: number,
  ): Promise<NguoiDungDto> {
    return await this.usersService.getUserInfoById(tai_khoan);
  }

  @Post('ThemNguoiDung')
  async addUser(@Body() userInfo: AddNguoiDungDTO) {
    return await this.usersService.addUser(userInfo);
  }
}

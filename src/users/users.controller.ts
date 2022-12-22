import {
  Controller,
  Req,
  Body,
  Get,
  Post,
  Put,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  NotFoundException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

// import local Type
import { PaginationQuery, RequestWithUser } from '../dto/common.dto';
import {
  CreateNguoiDungDtoAdmin,
  LoaiNguoiDung,
  NguoiDungDto,
  UpdateNguoiDungDto,
  UpdateNguoiDungDtoAdmin,
} from './user-dto/user.dto';

// import local service
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('Quản lí người dùng')
@Controller('QuanLyNguoiDung')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('LayDanhSachLoaiNguoiDung')
  getUserRoles(): LoaiNguoiDung[] {
    return this.usersService.getUserRole();
  }

  @Get('LayDanhSachNguoiDung')
  async getUserList(): Promise<NguoiDungDto[]> {
    return await this.usersService.getUserList();
  }

  @ApiQuery({ name: 'tuKhoa', required: false })
  @Get('TimKiemNguoiDung')
  async getUserByName(
    @Query('tuKhoa', new DefaultValuePipe('')) tuKhoa: string,
  ): Promise<NguoiDungDto[]> {
    return await this.usersService.getUsersByName(tuKhoa);
  }

  @Get('TimKiemNguoiDungPhanTrang')
  async getUsersPagination(
    @Query()
    { tuKhoa, soTrang, soPhanTuTrenTrang }: PaginationQuery,
  ): Promise<NguoiDungDto[]> {
    return this.usersService.getUsersPagination(
      tuKhoa,
      soTrang,
      soPhanTuTrenTrang,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
  @Get('ThongTinTaiKhoan')
  getUserInfo(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('LayThongTinNguoiDung/:taiKhoan')
  async getUserInfoById(
    @Param('taiKhoan') tai_khoan: number,
  ): Promise<NguoiDungDto> {
    const user = await this.usersService.getUserInfoById(tai_khoan);
    if (user) {
      return user;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User does not exist',
      error: 'Not Found',
    });
  }

  @Post('ThemNguoiDung')
  async addUser(@Body() userInfo: CreateNguoiDungDtoAdmin) {
    return await this.usersService.addUser(userInfo);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
  @Put('CapNhatThongTinNguoiDung')
  async updateUser(
    @Req() req: RequestWithUser,
    @Body() body: UpdateNguoiDungDto,
  ): Promise<NguoiDungDto> {
    const { taiKhoan, email } = req.user;
    await this.authService.validateUser({ email, matKhau: body.matKhau });
    return await this.usersService.updateUser(body, taiKhoan);
  }

  @Put('CapNhatThongTinNguoiDungAdmin')
  async updateUserAdmin(
    @Body() body: UpdateNguoiDungDtoAdmin,
  ): Promise<NguoiDungDto> {
    return await this.usersService.updateUserAdmin(body);
  }

  @Delete('XoaNguoiDung/:taiKhoan')
  async deleteUser(
    @Param('taiKhoan', ParseIntPipe) taiKhoan: number,
  ): Promise<string> {
    return await this.usersService.deleteUser(taiKhoan);
  }
}

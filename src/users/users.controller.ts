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
import {
  PaginationQuery,
  PaginationRes,
  RequestWithUser,
} from '../dto/common.dto';
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

  @Get('TimKiemNguoiDung')
  @ApiQuery({ name: 'tuKhoa', required: false })
  async getUserByName(
    @Query('tuKhoa', new DefaultValuePipe('')) tuKhoa: string,
  ): Promise<NguoiDungDto[]> {
    return await this.usersService.getUsersByName(tuKhoa);
  }

  @Get('TimKiemNguoiDungPhanTrang')
  async getUsersPagination(
    @Query()
    { tuKhoa, currentPage, itemsPerPage }: PaginationQuery,
  ): Promise<PaginationRes<NguoiDungDto>> {
    return this.usersService.getUsersPagination(
      tuKhoa,
      currentPage,
      itemsPerPage,
    );
  }

  @Get('ThongTinTaiKhoan')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
  getUserInfo(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('LayThongTinNguoiDung/:taiKhoan')
  async getUserInfoById(
    @Param('taiKhoan', ParseIntPipe) tai_khoan: number,
  ): Promise<NguoiDungDto> {
    const user = await this.usersService.getUserInfoById(tai_khoan);
    if (user) {
      return user;
    }
    throw new NotFoundException('User does not exist');
  }

  @Post('ThemNguoiDung')
  async addUser(@Body() userInfo: CreateNguoiDungDtoAdmin) {
    return await this.usersService.addUser(userInfo);
  }

  @Put('CapNhatThongTinNguoiDung')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'))
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

import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// import local service
import { BookingService } from './booking.service';

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';
import {
  CreateScheduleDto,
  LoaiNguoiDung,
  RequestWithUser,
  updateScheduleDto,
} from '../../dto/index.dto';

// import local guard
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('QuanLyDatVe')
@ApiTags('Quản lý đặt vé')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('DatVe')
  @Roles(LoaiNguoiDung.USER, LoaiNguoiDung.ADMIN)
  async bookTicket(
    @Req() { user }: RequestWithUser,
    @Body() bookingInfo: CreateManyBookingDto,
  ): Promise<string> {
    return await this.bookingService.bookTicket(bookingInfo, user.taiKhoan);
  }

  @Get('LayDanhSachGheTheoLichChieu/:maLichChieu')
  @Roles(LoaiNguoiDung.USER, LoaiNguoiDung.ADMIN)
  async getSeatBySchedule(
    @Param('maLichChieu', ParseIntPipe) maLichChieu: number,
  ) {
    return await this.bookingService.getSeatBySchedule(maLichChieu);
  }

  @Post('TaoLichChieu')
  @Roles(LoaiNguoiDung.ADMIN)
  async createSchedule(@Body() scheduleInfo: CreateScheduleDto) {
    return await this.bookingService.createSchedule(scheduleInfo);
  }

  @Put('CapNhatLichChieu')
  @Roles(LoaiNguoiDung.ADMIN)
  async updateSchedule(@Body() updateInfo: updateScheduleDto) {
    return await this.bookingService.updateSchedule(updateInfo);
  }

  @Delete('XoaLichChieu/:maLichChieu')
  @Roles(LoaiNguoiDung.ADMIN)
  async deleteSchedule(
    @Param('maLichChieu', ParseIntPipe) maLichChieu: number,
  ) {
    return await this.bookingService.deleteSchedule(maLichChieu);
  }
}

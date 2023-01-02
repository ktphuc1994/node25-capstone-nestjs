import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// import local service
import { BookingService } from './booking.service';

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';
import { CreateScheduleDto } from '../theatre/theatre-dto/theatre.dto';
import { LoaiNguoiDung } from '../dto/index.dto';

// import local guard
import { RolesGuard } from '../strategy/roles.strategy';
import { Roles } from '../decorator/roles.decorator';

@Controller('QuanLyDatVe')
@ApiTags('Quản lý đặt vé')
@ApiBearerAuth()
@UseGuards(AuthGuard('JwtAuth'), RolesGuard)
@Roles(LoaiNguoiDung.ADMIN)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('DatVe')
  @Roles(LoaiNguoiDung.USER)
  async bookTicket(@Body() bookingInfo: CreateManyBookingDto): Promise<string> {
    return await this.bookingService.bookTicket(bookingInfo);
  }

  @Get('LayDanhSachGheTheoLichChieu/:maLichChieu')
  @Roles(LoaiNguoiDung.USER)
  async getSeatBySchedule(
    @Param('maLichChieu', ParseIntPipe) maLichChieu: number,
  ) {
    return await this.bookingService.getSeatBySchedule(maLichChieu);
  }

  @Post('TaoLichChieu')
  async createSchedule(@Body() scheduleInfo: CreateScheduleDto) {
    return await this.bookingService.createSchedule(scheduleInfo);
  }
}

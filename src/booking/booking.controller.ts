import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// import local service
import { BookingService } from './booking.service';

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';
import { CreateScheduleDto } from '../theatre/theatre-dto/theatre.dto';

@ApiTags('Quản lý đặt vé')
@Controller('QuanLyDatVe')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('DatVe')
  async bookTicket(@Body() bookingInfo: CreateManyBookingDto): Promise<string> {
    return await this.bookingService.bookTicket(bookingInfo);
  }

  @Get('LayDanhSachGheTheoLichChieu/:maLichChieu')
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

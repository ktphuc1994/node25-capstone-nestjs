import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// import prisma
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { lichChieuSelect, seatSelect } from '../../prisma/prisma-select';
import { prismaErrorCodes } from '../errorCode/prismaErrorCode.enum';
const prisma = new PrismaClient();

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';
import { CreateScheduleDto } from '../theatre/theatre-dto/theatre.dto';

@Injectable()
export class BookingService {
  // POST Đặt vé xem phim
  async bookTicket(bookingInfo: CreateManyBookingDto): Promise<string> {
    try {
      const { maLichChieu, danhSachVe } = bookingInfo;

      const seatList = await prisma.ghe.findMany({
        where: {
          rapPhim: {
            lichChieu: { some: { maLichChieu } },
          },
          isRemoved: false,
        },
        select: { maGhe: true },
      });
      danhSachVe.forEach((ticket) => {
        const isValid = seatList.find((seat) => seat.maGhe === ticket.maGhe);
        if (!isValid) {
          throw new BadRequestException(
            `maGhe #${ticket.maGhe} does not exist in Schedule #${maLichChieu}`,
          );
        }
      });

      const bookingList = danhSachVe.map((ticket) => ({
        ...ticket,
        maLichChieu,
      }));
      await prisma.datVe.createMany({ data: bookingList });
      return 'Booked Successfully';
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === prismaErrorCodes.unique
      ) {
        throw new ConflictException(
          'One or more seats have already been booked. Or the request was duplicate. Please check and try again',
        );
      }
      throw err;
    }
  }

  // LẤY Danh sách ghế theo Lịch Chiếu
  async getSeatBySchedule(maLichChieu: number) {
    const [seatListRaw, bookedList, scheduleInfo] = await Promise.all([
      prisma.ghe.findMany({
        where: { rapPhim: { lichChieu: { some: { maLichChieu } } } },
        select: { ...seatSelect, maRap: false },
        orderBy: { maGhe: 'asc' },
      }),
      prisma.datVe.findMany({
        where: { maLichChieu },
        select: { maGhe: true, taiKhoan: true },
        orderBy: { maGhe: 'asc' },
      }),
      prisma.lichChieu.findFirst({
        where: { maLichChieu },
        select: {
          ngayGioChieu: true,
          phim: true,
          rapPhim: { select: { tenRap: true, cumRap: true } },
        },
      }),
    ]);

    if (!scheduleInfo) {
      throw new NotFoundException('Schedule Not Found');
    }

    let iRoot: number = 0;
    const seatList = seatListRaw.map((seat) => {
      let taiKhoan: number | null = null;
      for (let i = iRoot; i < bookedList.length; i++) {
        if (bookedList[i].maGhe === seat.maGhe) {
          taiKhoan = bookedList[i].taiKhoan;
          iRoot++;
          break;
        }
      }
      return {
        ...seat,
        daDat: taiKhoan ? true : false,
        taiKhoan,
      };
    });

    const { tenCumRap, diaChi } = scheduleInfo.rapPhim.cumRap;
    const { tenPhim, hinhAnh } = scheduleInfo.phim;

    const scheduleFullInfo = {
      maLichChieu,
      tenCumRap,
      diaChi,
      tenRap: scheduleInfo.rapPhim.tenRap,
      tenPhim,
      hinhAnh,
      ngayGioChieu: scheduleInfo.ngayGioChieu,
      danhSachGhe: seatList,
    };

    return scheduleFullInfo;
  }

  // POST Tạo lịch chiếu
  async createSchedule(scheduleInfo: CreateScheduleDto) {
    return await prisma.lichChieu.create({
      data: scheduleInfo,
      select: lichChieuSelect,
    });
  }
}

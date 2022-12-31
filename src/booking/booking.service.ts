import { Injectable, NotFoundException } from '@nestjs/common';

// import prisma
import { PrismaClient } from '@prisma/client';
import { seatSelect } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';

@Injectable()
export class BookingService {
  // POST Đặt vé xem phim
  async bookTicket(bookingInfo: CreateManyBookingDto): Promise<string> {
    const maLichChieu = 46078;
    const bookingList = bookingInfo.danhSachVe.map((ticket) => ({
      ...ticket,
      maLichChieu,
    }));
    await prisma.datVe.createMany({ data: bookingList });
    return 'Booked Successfully';
  }

  // LẤY Danh sách ghế theo Lịch Chiếu
  async getSeatBySchedule(maLichChieu: number) {
    const [seatListRaw, bookedList, scheduleInfo] = await Promise.all([
      prisma.ghe.findMany({
        where: { rapPhim: { lichChieu: { some: { maLichChieu } } } },
        select: { ...seatSelect, maRap: false },
      }),
      prisma.datVe.findMany({
        where: { maLichChieu },
        select: { maGhe: true, taiKhoan: true },
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
      throw new NotFoundException('Screening Schedule Not Found');
    }

    let iRoot: number = 0;
    const seatList = seatListRaw.map((seat) => {
      let taiKhoan: number | null = null;
      for (let i = iRoot; i < bookedList.length; i++) {
        if (bookedList[i].maGhe === seat.maGhe) {
          taiKhoan = bookedList[i].taiKhoan;
          iRoot++;
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
}

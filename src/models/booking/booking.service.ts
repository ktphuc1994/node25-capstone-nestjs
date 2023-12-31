import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// import prisma
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { lichChieuSelect, seatSelect } from '../../../prisma/prisma-select';
import { prismaErrorCodes } from '../../common/constants/prismaErrorCode.enum';
const prisma = new PrismaClient();

// import local DTO
import { CreateManyBookingDto } from './booking-dto/booking.dto';
import { CreateScheduleDto, updateScheduleDto } from '../../dto/index.dto';

@Injectable()
export class BookingService {
  // POST Đặt vé xem phim
  async bookTicket(
    bookingInfo: CreateManyBookingDto,
    taiKhoan: number,
  ): Promise<string> {
    try {
      const { maLichChieu, danhSachGhe } = bookingInfo;

      // kiểm tra các mã ghế trong danh sách vé có nằm trong danh sách ghế của lịch chiếu không.
      const seatList = await prisma.ghe.findMany({
        where: {
          rapPhim: {
            lichChieu: { some: { maLichChieu } },
          },
          isRemoved: false,
        },
        select: { maGhe: true },
      });
      danhSachGhe.forEach((bookedMaGhe) => {
        const isValid = seatList.find((seat) => seat.maGhe === bookedMaGhe);
        if (!isValid) {
          throw new BadRequestException(
            `maGhe #${bookedMaGhe} does not exist in Schedule #${maLichChieu}`,
          );
        }
      });

      const bookingList = danhSachGhe.map((maGhe) => ({
        taiKhoan,
        maGhe,
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
        select: { ...seatSelect },
        orderBy: { tenGhe: 'asc' },
      }),
      prisma.datVe.findMany({
        where: { maLichChieu },
        select: { maGhe: true, taiKhoan: true },
        orderBy: { ghe: { tenGhe: 'asc' } },
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

    // map lại danh sách ghế để được output như yêu cầu (thêm taiKhoan & daDat, được lấy từ bookedList)
    let i: number = 0;
    const seatList = seatListRaw.map((seat) => {
      let taiKhoan: number | null = null;
      if (i < bookedList.length && bookedList[i].maGhe === seat.maGhe) {
        taiKhoan = bookedList[i].taiKhoan;
        i++;
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

  // PUT Cập nhật lịch chiếu
  async updateSchedule(updateInfo: updateScheduleDto) {
    return await prisma.lichChieu.update({
      where: { maLichChieu: updateInfo.maLichChieu },
      data: updateInfo,
      select: lichChieuSelect,
    });
  }

  // DELETE Xóa lịch chiếu
  async deleteSchedule(maLichChieu: number) {
    return await prisma.lichChieu.delete({
      where: { maLichChieu },
      select: lichChieuSelect,
    });
  }
}

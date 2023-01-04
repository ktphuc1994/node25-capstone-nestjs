import { Injectable, NotFoundException } from '@nestjs/common';

// import Prisma
import { Prisma, PrismaClient } from '@prisma/client';
import {
  phimSelect,
  lichChieuSelect,
  theatreChainSelect,
} from '../../prisma/prisma-select';
import { MovieDto } from '../movie/movie-dto/movie.dto';
const prisma = new PrismaClient();

// import local DTO
import {
  lichChieuPhimRawDto,
  lichChieuPhimDto,
  TheatreChainDto,
  TheatreRoomDto,
} from './theatre-dto/theatre.dto';

@Injectable()
export class TheatreService {
  // LẤY Thông tin Hệ Thống Rạp
  async getTheatreChain(maHeThongRap: string): Promise<TheatreChainDto[]> {
    return await prisma.heThongRap.findMany({
      where: { maHeThongRap, isRemoved: false },
      select: theatreChainSelect,
    });
  }

  // LẤY Thông tin Cụm rạp có trong Hệ Thống Rạp
  async getTheatreList(maHeThongRap: string) {
    const theatreList = await prisma.cumRap.findMany({
      where: { maHeThongRap, isRemoved: false },
      select: {
        maCumRap: true,
        tenCumRap: true,
        diaChi: true,
        rapPhim: { select: { maRap: true, tenRap: true } },
      },
    });

    if (theatreList.length === 0) {
      throw new NotFoundException('maHeThongRap does not exist');
    }
    return theatreList;
  }

  // LẤY Thông tin lịch chiếu Phim
  async getScreenSchedule(maPhim: number) {
    const [movieInfo, rawLichChieu]: [MovieDto, lichChieuPhimRawDto[]] =
      await Promise.all([
        prisma.phim.findFirst({
          where: { maPhim, isRemoved: false },
          select: phimSelect,
        }),
        prisma.heThongRap.findMany({
          where: {
            cumRap: {
              some: { rapPhim: { some: { lichChieu: { some: { maPhim } } } } },
            },
            isRemoved: false,
          },
          select: {
            maHeThongRap: true,
            tenHeThongRap: true,
            logo: true,
            cumRap: {
              where: {
                rapPhim: { some: { lichChieu: { some: { maPhim } } } },
                isRemoved: false,
              },
              select: {
                maCumRap: true,
                tenCumRap: true,
                diaChi: true,
                rapPhim: {
                  where: { lichChieu: { some: { maPhim } }, isRemoved: false },
                  select: {
                    maRap: true,
                    tenRap: true,
                    lichChieu: {
                      where: { maPhim, isRemoved: false },
                      select: lichChieuSelect,
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

    if (!movieInfo) {
      throw new NotFoundException('Movie Not Found');
    }

    // map lại thông tin lịch chiếu để được output như yêu cầu
    const lichChieuFinal: lichChieuPhimDto[] = rawLichChieu.map((heThong) => ({
      maHeThongRap: heThong.maHeThongRap,
      tenHeThongRap: heThong.tenHeThongRap,
      logo: heThong.logo,
      cumRap: heThong.cumRap.map((cr) => ({
        maCumRap: cr.maCumRap,
        tenCumRap: cr.tenCumRap,
        diaChi: cr.diaChi,
        // sử dụng hàm reduce để gộp các Array (lichChieuList) lại thành một Array duy nhất (lichChieuPhim)
        lichChieuPhim: cr.rapPhim.reduce((accu, curr) => {
          // map lại lichChieu ở trong rapPhim
          const lichChieuList = curr.lichChieu.map((item) => ({
            maLichChieu: item.maLichChieu,
            maRap: item.maRap,
            tenRap: curr.tenRap,
            ngayGioChieu: item.ngayGioChieu,
          }));
          return [...accu, ...lichChieuList];
        }, []),
      })),
    }));
    return { ...movieInfo, heThongRap: lichChieuFinal };

    // MENTOR ƠI, CÓ CÁCH NÀO ĐỂ VIẾT RAW QUERY hoặc BẰNG PRISMA NGẮN HƠN KHÔNG? MENTOR CHỈ MÌNH VỚI.
    // CÁCH DƯỚI VIẾT RAWQUERY VẪN CHẠY ĐƯỢC, NHƯNG MÀ NÓ DÀI QUÁ DÀI.
    // const result = await prisma.$queryRaw`
    // SELECT
    // secondf.maPhim AS 'maPhim',
    // secondf.tenPhim AS 'tenPhim',
    // secondf.hinhAnh AS 'hinhAnh',
    // secondf.trailer AS 'trailer',
    // secondf.moTa AS 'moTa',
    // secondf.ngayKhoiChieu AS 'ngayKhoiChieu',
    // secondf.hot AS 'hot',
    // secondf.danhGia AS 'danhGia',
    // secondf.dangChieu AS 'dangChieu',
    // secondf.sapChieu AS 'sapChieu',
    // JSON_ARRAYAGG(
    //   JSON_OBJECT(
    //   'maHeThongRap', secondf.maHeThongRap,
    //   'tenHeThongRap', secondf.tenHeThongRap,
    //   'logo', secondf.logo,
    //   'cumRap', secondf.cumRap
    //   )
    // ) AS heThongRap
    // FROM (
    //   SELECT
    //   oh.maPhim AS 'maPhim',
    //   oh.tenPhim AS 'tenPhim',
    //   oh.hinhAnh AS 'hinhAnh',
    //   oh.trailer AS 'trailer',
    //   oh.moTa AS 'moTa',
    //   oh.ngayKhoiChieu AS 'ngayKhoiChieu',
    //   oh.hot AS 'hot',
    //   oh.danhGia AS 'danhGia',
    //   oh.dangChieu AS 'dangChieu',
    //   oh.sapChieu AS 'sapChieu',
    //   oh.maHeThongRap AS 'maHeThongRap',
    //   oh.tenHeThongRap AS 'tenHeThongRap',
    //   oh.logo AS 'logo',
    //   JSON_ARRAYAGG(
    //     JSON_OBJECT(
    //     'maCumRap', oh.maCumRap,
    //     'tenCumRap', oh.tenCumRap,
    //     'diaChi', oh.diaChi,
    //     'lichChieu', oh.lichChieu
    //     )
    //   ) AS cumRap
    //   FROM (
    //     SELECT
    //     Phim.ma_phim AS 'maPhim',
    //     Phim.ten_phim AS 'tenPhim',
    //     Phim.hinh_anh AS 'hinhAnh',
    //     Phim.trailer AS 'trailer',
    //     Phim.mo_ta AS 'moTa',
    //     Phim.ngay_khoi_chieu AS 'ngayKhoiChieu',
    //     Phim.hot AS 'hot',
    //     Phim.danh_gia AS 'danhGia',
    //     Phim.dang_chieu AS 'dangChieu',
    //     Phim.sap_chieu AS 'sapChieu',
    //     HeThongRap.ma_he_thong_rap AS 'maHeThongRap',
    //     HeThongRap.ten_he_thong_rap AS 'tenHeThongRap',
    //     HeThongRap.logo AS 'logo',
    //     CumRap.ma_cum_rap AS 'maCumRap',
    //     CumRap.ten_cum_rap AS 'tenCumRap',
    //     CumRap.dia_chi AS 'diaChi',
    //     JSON_ARRAYAGG(
    //       JSON_OBJECT(
    //       'maLichChieu', LichChieu.ma_lich_chieu,
    //       'maRap', LichChieu.ma_rap,
    //       'tenRap', RapPhim.ten_rap,
    //       'ngayGioChieu', LichChieu.ngay_gio_chieu
    //       )
    //     ) AS lichChieu
    //     FROM
    //     Phim
    //     INNER JOIN LichChieu ON Phim.ma_phim = LichChieu.ma_phim
    //     INNER JOIN RapPhim ON RapPhim.ma_rap = LichChieu.ma_rap
    //     INNER JOIN CumRap ON CumRap.ma_cum_rap = RapPhim.ma_cum_rap
    //     INNER JOIN HeThongRap ON HeThongRap.ma_he_thong_rap = CumRap.ma_he_thong_rap
    //     ${Prisma.sql([`WHERE Phim.ma_phim = ${maPhim}`])}
    //     GROUP BY CumRap.ma_cum_rap) AS oh
    //   GROUP BY oh.maHeThongRap) AS secondf
    // GROUP BY secondf.maPhim
    // `;
    // return result;
  }

  // LẤY Thông tin Lịch chiếu theo hệ thống rạp
  async getScheduleByChain(maHeThongRap: string) {
    const lichChieuRaw = await prisma.heThongRap.findMany({
      where: { maHeThongRap, isRemoved: false },
      select: {
        maHeThongRap: true,
        tenHeThongRap: true,
        logo: true,
        cumRap: {
          where: { isRemoved: false },
          select: {
            maCumRap: true,
            tenCumRap: true,
            diaChi: true,
            rapPhim: {
              where: { isRemoved: false },
              select: {
                maRap: true,
                tenRap: true,
                maCumRap: true,
                lichChieu: {
                  where: { isRemoved: false },
                  select: { ...lichChieuSelect, phim: { select: phimSelect } },
                },
              },
            },
          },
        },
      },
    });

    if (lichChieuRaw.length === 0) {
      throw new NotFoundException('maHeThongRap does not exist');
    }

    // lấy danh sách phim tương ứng với từng Cụm Rạp
    const getUniquePhim = (rapPhimArr: TheatreRoomDto[]): MovieDto[] => {
      const maPhimList = [];
      const phimList = [];
      rapPhimArr.forEach((rapPhim) => {
        rapPhim.lichChieu.forEach((lc) => {
          if (!maPhimList.includes(lc.maPhim)) {
            maPhimList.push(lc.maPhim);
            phimList.push(lc.phim);
          }
        });
      });
      return phimList;
    };

    const lichChieuFinal = lichChieuRaw.map((heThong) => ({
      maHeThongRap: heThong.maHeThongRap,
      tenHeThongRap: heThong.tenHeThongRap,
      logo: heThong.logo,
      cumRap: heThong.cumRap.map((cr) => ({
        maCumRap: cr.maCumRap,
        tenCumRap: cr.tenCumRap,
        diaChi: cr.diaChi,
        // lấy danh sách phim trong rạp phim, rồi map lại danh sách phim để ra output yêu cầu
        phim: getUniquePhim(cr.rapPhim).map((movie) => ({
          ...movie,
          lichChieuPhim: cr.rapPhim.reduce((accu, curr) => {
            // filter lịch chiếu tương ứng với phim(movie) hiện tại.
            // đây là lịch chiếu cho mỗi rạp. Sau khi qua hàm reduce ở trên thì sẽ thành lịch chiếu của cụm rạp
            const lichChieuFiltered = curr.lichChieu.filter((item) => {
              return (item.maPhim = movie.maPhim);
            });
            // map lại lịch chiếu phim theo output yêu cầu
            const lichChieuList = lichChieuFiltered.map((item) => ({
              maLichChieu: item.maLichChieu,
              maRap: item.maRap,
              tenRap: curr.tenRap,
              ngayGioChieu: item.ngayGioChieu,
            }));
            return [...accu, ...lichChieuList];
          }, []),
        })),
      })),
    }));

    return lichChieuFinal;
  }
}

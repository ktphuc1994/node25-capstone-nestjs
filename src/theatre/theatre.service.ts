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
  lichChieuPhimOldDto,
  lichChieuPhimNewDto,
  TheatreChainDto,
  TheatreRoomDto,
} from './theatre-dto/theatre.dto';

@Injectable()
export class TheatreService {
  // LẤY Thông tin Hệ Thống Rạp
  async getTheatreChain(maHeThongRap: string): Promise<TheatreChainDto[]> {
    return await prisma.heThongRap.findMany({
      where: { maHeThongRap },
      select: theatreChainSelect,
    });
  }

  // LẤY Thông tin Cụm rạp có trong Hệ Thống Rạp
  async getTheatreList(maHeThongRap: string) {
    const theatreList = await prisma.cumRap.findMany({
      where: { maHeThongRap },
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
    const [movieInfo, rawLichChieu]: [MovieDto, lichChieuPhimOldDto[]] =
      await Promise.all([
        prisma.phim.findFirst({ where: { maPhim }, select: phimSelect }),
        prisma.heThongRap.findMany({
          where: {
            cumRap: {
              some: { rapPhim: { some: { lichChieu: { some: { maPhim } } } } },
            },
          },
          select: {
            maHeThongRap: true,
            tenHeThongRap: true,
            logo: true,
            cumRap: {
              where: { rapPhim: { some: { lichChieu: { some: { maPhim } } } } },
              select: {
                maCumRap: true,
                tenCumRap: true,
                diaChi: true,
                rapPhim: {
                  where: { lichChieu: { some: { maPhim } } },
                  select: {
                    maRap: true,
                    tenRap: true,
                    lichChieu: { where: { maPhim }, select: lichChieuSelect },
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

    const lichChieuFinal: lichChieuPhimNewDto[] = rawLichChieu.map(
      (heThong) => ({
        maHeThongRap: heThong.maHeThongRap,
        tenHeThongRap: heThong.tenHeThongRap,
        logo: heThong.logo,
        cumRap: heThong.cumRap.map((cr) => ({
          maCumRap: cr.maCumRap,
          tenCumRap: cr.tenCumRap,
          diaChi: cr.diaChi,
          lichChieuPhim: cr.rapPhim.reduce((accu, curr) => {
            const lichChieuList = curr.lichChieu.map((item) => ({
              maLichChieu: item.maLichChieu,
              maRap: item.maRap,
              tenRap: curr.tenRap,
              ngayGioChieu: item.ngayGioChieu,
            }));
            return [...accu, ...lichChieuList];
          }, []),
        })),
      }),
    );
    return { ...movieInfo, heThongRap: lichChieuFinal };

    // MENTOR ƠI, CÓ CÁCH NÀO ĐỂ VIẾT RAW QUERY hoặc BẰNG PRISMA NGẮN HƠN KHÔNG? CHỈ MÌNH VỚI.
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
    const lichChieuOld = await prisma.heThongRap.findMany({
      where: { maHeThongRap },
      select: {
        maHeThongRap: true,
        tenHeThongRap: true,
        logo: true,
        cumRap: {
          select: {
            maCumRap: true,
            tenCumRap: true,
            diaChi: true,
            rapPhim: {
              select: {
                maRap: true,
                tenRap: true,
                maCumRap: true,
                lichChieu: {
                  select: { ...lichChieuSelect, phim: { select: phimSelect } },
                },
              },
            },
          },
        },
      },
    });

    const getUniqueMaPhim = (rapPhimArr: TheatreRoomDto[]): MovieDto[] => {
      const maPhimList = [];
      rapPhimArr.forEach((rapPhim) => {
        rapPhim.lichChieu.forEach((lc) => {
          if (!maPhimList.includes(lc.maPhim)) {
            maPhimList.push(lc.phim);
          }
        });
      });
      return maPhimList;
    };

    const lichChieuNew = lichChieuOld.map((heThong) => ({
      maHeThongRap: heThong.maHeThongRap,
      tenHeThongRap: heThong.tenHeThongRap,
      logo: heThong.logo,
      cumRap: heThong.cumRap.map((cr) => ({
        maCumRap: cr.maCumRap,
        tenCumRap: cr.tenCumRap,
        diaChi: cr.diaChi,
        phim: getUniqueMaPhim(cr.rapPhim).map((movie) => ({
          ...movie,
          lichChieuPhim: cr.rapPhim.reduce((accu, curr) => {
            const lichChieuFiltered = curr.lichChieu.filter((item) => {
              return (item.maPhim = movie.maPhim);
            });
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

    return lichChieuNew;
  }
}

// SELECT
// HeThongRap.ma_he_thong_rap AS 'maHeThongRap',
// HeThongRap.ten_he_thong_rap AS 'tenHeThongRap',
// HeThongRap.logo AS 'logo',
// JSON_ARRAYAGG(
//  JSON_OBJECT(
//   'maCumRap', CumRap.ma_cum_rap,
//   'tenCumRap', CumRap.ten_cum_rap,
//   'diaChi', CumRap.dia_chi,
//   'lichChieu',
//   JSON_ARRAYAGG(
//    JSON_OBJECT(
//     'maLichChieu', LichChieu.ma_lich_chieu,
//     'maRap', LichChieu.ma_rap,
//     'tenRap', RapPhim.ten_rap,
//     'ngayGioChieu', LichChieu.ngay_gio_chieu
//    )
//   ) AS lichChieuArr
//  )
// ) AS cumRap
// FROM
// Phim
// INNER JOIN LichChieu ON Phim.ma_phim = LichChieu.ma_phim
// INNER JOIN RapPhim ON RapPhim.ma_rap = LichChieu.ma_rap
// INNER JOIN CumRap ON CumRap.ma_cum_rap = RapPhim.ma_cum_rap
// INNER JOIN HeThongRap ON HeThongRap.ma_he_thong_rap = CumRap.ma_he_thong_rap
// WHERE Phim.ma_phim = 10351
// GROUP BY HeThongRap.ma_he_thong_rap, CumRap.ma_cum_rap;

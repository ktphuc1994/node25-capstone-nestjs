import { Request } from 'express';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { PrismaClient, Prisma } from '@prisma/client';
import { bannerSelect, phimSelect } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import bcrypt
import * as bcrypt from 'bcrypt';

// import local DTO
import {
  BannerDto,
  CreateMovieDto,
  MovieDto,
  UpdateMovieDto,
} from './movie-dto/movie.dto';
import { PaginationMovieQuery, PaginationRes } from '../dto/index.dto';

// custom response
import { PagiRes } from '../general/responseModel';
import { getFileUrl } from '../utils/utils';

@Injectable()
export class MovieService {
  constructor(private readonly configService: ConfigService) {}

  // LẤY Danh sách Banner
  async getBanner(): Promise<BannerDto[]> {
    return await prisma.banner.findMany({ select: bannerSelect });
  }

  // LẤY Thông tin Phim
  async getMovieInfo(maPhim: number): Promise<MovieDto> {
    const movieInfo = await prisma.phim.findFirst({
      where: { maPhim },
      select: phimSelect,
    });

    if (!movieInfo) throw new NotFoundException('Movie is not found.');
    return movieInfo;
  }

  // LẤY Danh sách Phim theo Tên
  async getMovieList(tenPhim: string): Promise<MovieDto[]> {
    return await prisma.phim.findMany({
      where: { tenPhim: { contains: tenPhim } },
      select: phimSelect,
    });
  }

  // LẤY Danh sách phim theo tên Phim, theo ngày Công Chiêu & Phân trang
  async getMoviePagination(
    query: PaginationMovieQuery,
  ): Promise<PaginationRes<MovieDto>> {
    const { tenPhim, currentPage, itemsPerPage, fromDate, toDate } = query;

    const [movieList, totalItems] = await Promise.all([
      prisma.phim.findMany({
        where: {
          tenPhim: { contains: tenPhim },
          ngayKhoiChieu: { gte: fromDate, lte: toDate },
        },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
        select: phimSelect,
      }),
      prisma.phim.count({ where: { tenPhim: { contains: tenPhim } } }),
    ]);

    return new PagiRes<MovieDto>({
      currentPage,
      itemsPerPage,
      totalItems,
      items: movieList,
    }).res();
  }

  // UPLOAD Hình Phim
  async uploadImage(req: Request, maPhim: number, filename: string) {
    await prisma.phim.update({
      data: { hinhAnh: filename },
      where: { maPhim },
    });
    const fileUrl = getFileUrl(
      req,
      this.configService.get('MOVIE_URL'),
      filename,
    );
    return { fileUrl };
  }

  // THÊM Phim mới
  async createMovie(movieInfo: CreateMovieDto): Promise<MovieDto> {
    return await prisma.phim.create({ data: movieInfo, select: phimSelect });
  }

  // CẬP NHẬT Phim
  async updateMovie(updateInfo: UpdateMovieDto): Promise<MovieDto> {
    return await prisma.phim.update({
      where: { maPhim: updateInfo.maPhim },
      data: updateInfo,
      select: phimSelect,
    });
  }

  // XÓA Phim
  async deleteMovie(maPhim: number): Promise<MovieDto> {
    return await prisma.phim.delete({ where: { maPhim }, select: phimSelect });
  }
}

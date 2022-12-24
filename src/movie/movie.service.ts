import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { PrismaClient } from '@prisma/client';
import { bannerSelect, phimSelect } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import bcrypt
import * as bcrypt from 'bcrypt';

// import local DTO
import { BannerDto, MovieDto } from './movie-dto/movie.dto';
import { PaginationMovieQuery, PaginationRes } from '../dto/index.dto';

// custom response
import { pagiRes } from '../general/responseModel';

@Injectable()
export class MovieService {
  constructor(private readonly configService: ConfigService) {}

  async getBanner(): Promise<BannerDto[]> {
    return await prisma.banner.findMany({ select: bannerSelect });
  }

  async getMovieList(tenPhim: string): Promise<MovieDto[]> {
    return await prisma.phim.findMany({
      where: { tenPhim: { contains: tenPhim } },
      select: phimSelect,
    });
  }

  async getMoviePagination(
    query: PaginationMovieQuery,
  ): Promise<PaginationRes<MovieDto>> {
    const { tenPhim, soTrang, soPhanTuTrenTrang } = query;
    const [movieList, totalCount] = await Promise.all([
      prisma.phim.findMany({
        where: { tenPhim: { contains: tenPhim } },
        skip: (soTrang - 1) * soPhanTuTrenTrang,
        take: soPhanTuTrenTrang,
        select: phimSelect,
      }),
      prisma.phim.count({ where: { tenPhim: { contains: tenPhim } } }),
    ]);
    return pagiRes(soTrang, soPhanTuTrenTrang, totalCount, movieList);
  }
}

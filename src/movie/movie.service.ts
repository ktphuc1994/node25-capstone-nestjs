import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import prisma
import { NguoiDung, PrismaClient, Prisma } from '@prisma/client';
import { userSelectNoPass } from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import bcrypt
import * as bcrypt from 'bcrypt';

// import local DTO
import { MovieEntity, BannerEntity } from './movie-dto/movie.dto';

@Injectable()
export class MovieService {
  constructor(private readonly configService: ConfigService) {}
  async getBanner(): Promise<BannerEntity[]> {
    return await prisma.banner.findMany();
  }
}

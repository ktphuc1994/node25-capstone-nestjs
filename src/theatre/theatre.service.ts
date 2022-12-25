import { Injectable, NotFoundException } from '@nestjs/common';

// import Prisma
import { PrismaClient } from '@prisma/client';
import {
  theatreChainSelect,
  theatreRoomSelect,
  theatreSelect,
} from '../../prisma/prisma-select';
const prisma = new PrismaClient();

// import local DTO
import { TheatreChainDto, TheatreDto } from './theatre-dto/theatre.dto';

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
}

import { ApiProperty } from '@nestjs/swagger';

// import prisma class
import { Banner, Phim } from '@prisma/client';

// import validator and transform
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MovieEntity implements Phim {
  maPhim: number;
  tenPhim: string;
  trailer: string;
  hinhAnh: string;
  moTa: string;
  ngayKhoiChieu: Date;
  danhGia: number;
  hot: boolean;
  dangChieu: boolean;
  sapChieu: boolean;
  isRemoved: boolean;
}

export class BannerEntity implements Banner {
  @IsNumber()
  @ApiProperty()
  maBanner: number;

  @IsNumber()
  @ApiProperty()
  maPhim: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  hinhAnh: string;

  @Exclude()
  isRemoved: boolean;
}

import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

// import prisma class
import { Banner, Phim } from '@prisma/client';

// import validator and transform
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class MovieEntity implements Phim {
  @IsNumber()
  @ApiProperty()
  maPhim: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenPhim: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  trailer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  hinhAnh: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  moTa: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  ngayKhoiChieu: string;

  @IsNumber()
  @ApiPropertyOptional()
  danhGia: number;

  @IsBoolean()
  @ApiPropertyOptional()
  hot: boolean;

  @IsBoolean()
  @ApiProperty()
  dangChieu: boolean;

  @IsBoolean()
  @ApiProperty()
  sapChieu: boolean;

  @Exclude()
  @IsBoolean()
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

export class BannerDto extends OmitType(BannerEntity, ['isRemoved']) {}

export class MovieDto extends OmitType(MovieEntity, ['isRemoved']) {}

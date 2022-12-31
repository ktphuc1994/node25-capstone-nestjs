import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

// import prisma
import {
  CumRap,
  DatVe,
  Ghe,
  HeThongRap,
  LichChieu,
  RapPhim,
} from '@prisma/client';

// import local DTO
import { MovieDto } from '../../movie/movie-dto/movie.dto';
import { NguoiDungDto } from '../../users/user-dto/user.dto';

// import validator and transformer
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class TheatreChainEntity implements HeThongRap {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  maHeThongRap: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenHeThongRap: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  logo: string;

  @IsOptional()
  @ApiPropertyOptional()
  cumRap?: TheatreDto[];

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;
}

export class TheatreEntity implements CumRap {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  maCumRap: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenCumRap: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  diaChi: string;

  @IsOptional()
  @ApiPropertyOptional()
  rapPhim?: TheatreRoomDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  maHeThongRap: string;

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;
}

export class TheatreRoomEntity implements RapPhim {
  @IsNumber()
  @ApiProperty()
  maRap: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenRap: string;

  @IsOptional()
  @ApiPropertyOptional()
  ghe?: SeatDto[];

  @IsOptional()
  @ApiPropertyOptional()
  lichChieu?: ScheduleDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  maCumRap: string;

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;
}
export class TheatreRoomDto extends OmitType(TheatreRoomEntity, [
  'isRemoved',
]) {}

export class ScheduleEntity implements LichChieu {
  @IsNumber()
  @ApiProperty()
  maLichChieu: number;

  @IsNumber()
  @ApiProperty()
  maRap: number;

  @IsNumber()
  @ApiProperty()
  maPhim: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  ngayGioChieu: string;

  @IsOptional()
  @ApiPropertyOptional()
  rapPhim?: TheatreRoomDto;

  @IsOptional()
  @ApiPropertyOptional()
  phim?: MovieDto;

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;
}

export class SeatEntity implements Ghe {
  @IsNumber()
  @ApiProperty()
  maGhe: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tenGhe: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  loaiGhe: string;

  @IsNumber()
  @ApiProperty()
  maRap: number;

  @IsNumber()
  @ApiProperty()
  giaVe: number;

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;
}

export class TheatreChainDto extends OmitType(TheatreChainEntity, [
  'isRemoved',
]) {}

export class TheatreDto extends OmitType(TheatreEntity, ['isRemoved']) {}

export class ScheduleDto extends OmitType(ScheduleEntity, ['isRemoved']) {}

export class SeatDto extends OmitType(SeatEntity, ['isRemoved']) {}

export class lichChieuCumRapOldDto {
  maCumRap: string;
  tenCumRap: string;
  diaChi: string;
  rapPhim: {
    maRap: number;
    tenRap: string;
    lichChieu: {
      maRap: number;
      maLichChieu: number;
      maPhim: number;
      ngayGioChieu: string;
    }[];
  }[];
}
export class lichChieuCumRapNewDto {
  maCumRap: string;
  tenCumRap: string;
  diaChi: string;
  lichChieuPhim: {
    maLichChieu: number;
    maRap: number;
    tenRap: string;
    ngayGioChieu: string;
  }[];
}
export class lichChieuPhimOldDto {
  maHeThongRap: string;
  tenHeThongRap: string;
  logo: string;
  cumRap: Array<lichChieuCumRapOldDto>;
}
export class lichChieuPhimNewDto {
  maHeThongRap: string;
  tenHeThongRap: string;
  logo: string;
  cumRap: Array<lichChieuCumRapNewDto>;
}

import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

// import prisma
import { CumRap, Ghe, HeThongRap, RapPhim } from '@prisma/client';

// import validator and transformer
import {
  IsBoolean,
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
  ghe?: seatDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  maCumRap: string;

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

export class TheatreRoomDto extends OmitType(TheatreRoomEntity, [
  'isRemoved',
]) {}

export class seatDto extends OmitType(SeatEntity, ['isRemoved']) {}

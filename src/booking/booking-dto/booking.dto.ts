import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';

// import prisma model
import { DatVe, LichChieu } from '@prisma/client';

// import validator
import { Exclude, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

// import local DTO
import { NguoiDungDto } from '../../dto/index.dto';
import { ScheduleDto, SeatDto } from '../../theatre/theatre-dto/theatre.dto';

export class BookingEntity implements DatVe {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  taiKhoan: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  maLichChieu: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  maGhe: number;

  @Exclude()
  @IsBoolean()
  isRemoved: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  nguoiDung?: NguoiDungDto;

  @IsOptional()
  @ApiPropertyOptional()
  lichChieu?: ScheduleDto;

  @IsOptional()
  @ApiPropertyOptional()
  ghe?: SeatDto;
}

export class BookingDto extends OmitType(BookingEntity, ['isRemoved']) {}
export class CreateBookingDto extends PickType(BookingEntity, [
  'taiKhoan',
  'maLichChieu',
  'maGhe',
]) {}

export class UserSeatDto extends PickType(BookingEntity, [
  'taiKhoan',
  'maGhe',
]) {}
export class CreateManyBookingDto extends PickType(BookingEntity, [
  'maLichChieu',
]) {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserSeatDto)
  @ApiProperty({ type: [UserSeatDto] })
  danhSachVe: UserSeatDto[];
}

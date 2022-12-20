import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export enum LoaiNguoiDung {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Exclude()
export class FullNguoiDungDto {
  @IsNumber()
  @ApiProperty()
  @Expose()
  tai_khoan: number;

  @IsEmail()
  @ApiProperty()
  @Expose()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mat_khau: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  ho_ten: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  so_dt: string;

  @IsEnum(LoaiNguoiDung)
  @ApiProperty()
  @Expose()
  loai_nguoi_dung: string;
}

export class LoginInfoDto extends PickType(FullNguoiDungDto, [
  'email',
  'mat_khau',
]) {}

export class NguoiDungDto extends OmitType(FullNguoiDungDto, ['mat_khau']) {}

export class CreateNguoiDungDto extends OmitType(FullNguoiDungDto, [
  'tai_khoan',
  'loai_nguoi_dung',
]) {}

export class UpdateNguoiDungDto extends OmitType(FullNguoiDungDto, [
  'tai_khoan',
  'loai_nguoi_dung',
]) {}

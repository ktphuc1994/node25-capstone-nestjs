import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { NguoiDung } from '@prisma/client';
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
export class NguoiDungEntity implements NguoiDung {
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

  @Exclude()
  is_removed: boolean;
}

export class LoginInfoDto extends PickType(NguoiDungEntity, [
  'email',
  'mat_khau',
]) {}

export class NguoiDungDto extends OmitType(NguoiDungEntity, [
  'mat_khau',
  'is_removed',
]) {}

export class CreateNguoiDungDto extends OmitType(NguoiDungEntity, [
  'tai_khoan',
  'loai_nguoi_dung',
  'is_removed',
]) {}

export class UpdateNguoiDungDto extends OmitType(NguoiDungEntity, [
  'tai_khoan',
  'loai_nguoi_dung',
  'is_removed',
]) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mat_khau_moi: string;
}

export class CreateNguoiDungDtoAdmin extends OmitType(NguoiDungEntity, [
  'tai_khoan',
  'is_removed',
]) {}

export class UpdateNguoiDungDtoAdmin extends OmitType(NguoiDungEntity, [
  'is_removed',
]) {}

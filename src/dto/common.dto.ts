import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { Request } from 'express';
import { NguoiDungDto } from './index.dto';

export interface RequestWithUser extends Request {
  user: NguoiDungDto;
}

export class PaginationQuery {
  @IsString()
  @ApiPropertyOptional()
  tuKhoa: string = '';

  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  soTrang: number = 1;

  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  soPhanTuTrenTrang: number = 10;
}

export interface ResSuccess<T> {
  message: string;
  content: T;
}

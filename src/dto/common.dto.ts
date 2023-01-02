import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
  currentPage: number = 1;

  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  itemsPerPage: number = 10;
}

export class PaginationMovieQuery {
  @IsString()
  @ApiPropertyOptional()
  tenPhim: string = '';

  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  currentPage: number = 1;

  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional()
  itemsPerPage: number = 10;

  @IsDateString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  fromDate: string = '1970-01-01T00:00:01.000Z';

  @IsDateString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  toDate: string = '2099-01-01T01:00:01.000Z';
}

export class PaginationRes<T> {
  currentPage: number;
  itemsOnThisPage: number;
  totalPages: number;
  totalItems: number;
  items: Array<T>;
}

export interface ResSuccess<T> {
  message: string;
  content: T;
}

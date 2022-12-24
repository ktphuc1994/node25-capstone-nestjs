import {
  Controller,
  Req,
  Body,
  Get,
  Post,
  Put,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  NotFoundException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

// import local Type
import {
  PaginationMovieQuery,
  PaginationQuery,
  PaginationRes,
  RequestWithUser,
} from '../dto/common.dto';
import { BannerDto, MovieDto } from './movie-dto/movie.dto';

// import local service
import { MovieService } from './movie.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('Quản lí Phim')
@Controller('QuanLyPhim')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly authService: AuthService,
  ) {}

  @Get('LayDanhSachBanner')
  async getBanner(): Promise<BannerDto[]> {
    return await this.movieService.getBanner();
  }

  @ApiQuery({ name: 'tenPhim', required: false })
  @Get('LayDanhSachPhim')
  async getMovieList(
    @Query('tenPhim', new DefaultValuePipe('')) tenPhim: string,
  ): Promise<MovieDto[]> {
    return await this.movieService.getMovieList(tenPhim);
  }

  @Get('LayDanhSachPhimPhanTrang')
  async getMoviePagination(
    @Query() query: PaginationMovieQuery,
  ): Promise<PaginationRes<MovieDto>> {
    return await this.movieService.getMoviePagination(query);
  }
}

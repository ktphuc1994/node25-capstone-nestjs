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
import { PaginationQuery, RequestWithUser } from '../dto/common.dto';
import { BannerEntity } from './movie-dto/movie.dto';

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
  async getBanner(): Promise<BannerEntity[]> {
    return await this.movieService.getBanner();
  }
}

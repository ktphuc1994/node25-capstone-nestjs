import * as fs from 'fs';
import { Request } from 'express';
import {
  Controller,
  Req,
  Body,
  Get,
  Post,
  Put,
  Param,
  Query,
  DefaultValuePipe,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  PayloadTooLargeException,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

// import multer
import { diskStorage } from 'multer';

// import local Type
import { PaginationMovieQuery, PaginationRes } from '../dto/common.dto';
import {
  BannerDto,
  CreateMovieDto,
  MovieDto,
  UpdateMovieDto,
} from './movie-dto/movie.dto';
import { FileUploadDto } from '../dto/upload.dto';
import { LoaiNguoiDung } from '../dto/index.dto';

// import local service
import { MovieService } from './movie.service';

// import local filter
import { uploadFileFilter } from '../filter/upload-file.filter';

// import local guard
import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../strategy/roles.strategy';

@Controller('QuanLyPhim')
@ApiTags('Quản lý phim')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly configService: ConfigService,
  ) {}

  @Get('LayDanhSachBanner')
  async getBanner(): Promise<BannerDto[]> {
    return await this.movieService.getBanner();
  }

  @Get('LayThongTinPhim/:maPhim')
  async getMovieInfo(
    @Param('maPhim', ParseIntPipe) maPhim: number,
  ): Promise<MovieDto> {
    return await this.movieService.getMovieInfo(maPhim);
  }

  @Get('LayDanhSachPhim')
  @ApiQuery({ name: 'tenPhim', required: false })
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

  @Post('upload/:maPhim')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Movie Image',
    type: FileUploadDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'), RolesGuard)
  @Roles(LoaiNguoiDung.ADMIN)
  @UseInterceptors(
    FileInterceptor('movie', {
      fileFilter: uploadFileFilter('jpg', 'jpeg', 'png', 'webp'),
      storage: diskStorage({
        destination: process.env.MOVIE_URL,
        filename(req, file, callback) {
          callback(null, Date.now() + '_' + file.originalname);
        },
      }),
    }),
  )
  uploadImage(
    @Param('maPhim', ParseIntPipe) maPhim: number,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileLimit = Number(this.configService.get('MOVIE_FILE_LIMIT'));
    if (file.size > fileLimit * 1024 * 1024) {
      fs.unlinkSync(
        process.cwd() +
          '/' +
          this.configService.get('MOVIE_URL') +
          '/' +
          file.filename,
      );
      throw new PayloadTooLargeException(
        `File can not be larger than ${fileLimit} MB(s)`,
      );
    }
    return this.movieService.uploadImage(req, maPhim, file.filename);
  }

  @Post('ThemPhim')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'), RolesGuard)
  @Roles(LoaiNguoiDung.ADMIN)
  async createMovie(@Body() movieInfo: CreateMovieDto): Promise<MovieDto> {
    return await this.movieService.createMovie(movieInfo);
  }

  @Put('CapNhatPhim')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'), RolesGuard)
  @Roles(LoaiNguoiDung.ADMIN)
  async updateMovie(@Body() updateInfo: UpdateMovieDto): Promise<MovieDto> {
    return await this.movieService.updateMovie(updateInfo);
  }

  @Delete('XoaPhim/:maPhim')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('JwtAuth'), RolesGuard)
  @Roles(LoaiNguoiDung.ADMIN)
  async deleteMovie(
    @Param('maPhim', ParseIntPipe) maPhim: number,
  ): Promise<MovieDto> {
    return await this.movieService.deleteMovie(maPhim);
  }
}

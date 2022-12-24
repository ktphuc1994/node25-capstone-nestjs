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
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  NotFoundException,
  HttpStatus,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { BannerDto, MovieDto } from './movie-dto/movie.dto';
import { FileUploadDto, InterfaceUploadFile } from '../dto/upload.dto';

// import local service
import { MovieService } from './movie.service';
import { AuthService } from '../auth/auth.service';
import { uploadFileFilter } from '../filter/upload-file.filter';

@ApiTags('Quản lí Phim')
@Controller('QuanLyPhim')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('LayDanhSachBanner')
  async getBanner(): Promise<BannerDto[]> {
    return await this.movieService.getBanner();
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
    @Param('maPhim') maPhim: number,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.movieService.uploadImage(req, maPhim, file.filename);
  }
}

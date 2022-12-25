import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

// import local services
import { TheatreService } from './theatre.service';

// import local DTO
import { TheatreChainDto, TheatreDto } from './theatre-dto/theatre.dto';

@ApiTags('Quản lý rạp')
@Controller('QuanLyRap')
export class TheatreController {
  constructor(private readonly theatreService: TheatreService) {}

  @Get('LayThongTinHeThongRap')
  @ApiQuery({ name: 'maHeThongRap', required: false })
  async getTheatreChain(
    @Query('maHeThongRap') maHeThongRap: string,
  ): Promise<TheatreChainDto[]> {
    return await this.theatreService.getTheatreChain(maHeThongRap);
  }

  @Get('LayThongTinCumRapTheoHeThong/:maHeThongRap')
  async getTheatreList(@Param('maHeThongRap') maHeThongRap: string) {
    return await this.theatreService.getTheatreList(maHeThongRap);
  }
}

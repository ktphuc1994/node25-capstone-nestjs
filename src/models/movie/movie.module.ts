import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

@Module({
  imports: [AuthModule],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}

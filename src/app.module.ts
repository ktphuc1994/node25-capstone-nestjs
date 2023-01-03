import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import local modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MovieModule } from './movie/movie.module';

// import local controllers
import { AppController } from './app.controller';

// import local services
import { AppService } from './app.service';

// import local filter
import { HttpExceptionFilter } from './filter/http-exceptions.filter';
import { PrismaClientExceptionFilter } from './filter/prisma-client-exceptions.filter';
import { TheatreModule } from './theatre/theatre.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    MovieModule,
    TheatreModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}

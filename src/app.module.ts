import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import local modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

// import local controllers
import { AppController } from './app.controller';

// import local services
import { AppService } from './app.service';

// import local filter
import { HttpExceptionFilter } from './filter/http-exceptions.filter';
import { PrismaClientExceptionFilter } from './filter/prisma-client-exceptions.filter';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}

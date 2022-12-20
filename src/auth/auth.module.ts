import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// import local module
import { UsersModule } from '../users/users.module';

// import controller
import { AuthController } from './auth.controller';

// import local service
import { AuthService } from './auth.service';

// import JWT
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../strategy/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '30 days' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

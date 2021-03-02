import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema } from './schemas/refresh-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfigService } from '../config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { UserSchema } from '../user/schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'User', schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: AuthConfigService,
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

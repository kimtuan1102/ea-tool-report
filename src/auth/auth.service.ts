import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { v4 } from 'uuid';
import { getClientIp } from 'request-ip';
import { Request } from 'express';
import { Model } from 'mongoose';
import { RefreshToken } from './interfaces/refresh-token.interface';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  createAccessToken(user: User) {
    const jwtPayload = AuthService.buildJwtPayload(user);
    return this.jwtService.sign(jwtPayload);
  }

  async createRefreshToken(req: Request, userId) {
    const refreshToken = new this.refreshTokenModel({
      userId,
      refreshToken: v4(),
      ip: AuthService.getIp(req),
      browser: AuthService.getBrowserInfo(req),
      country: AuthService.getCountry(req),
    });
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOne({
      refreshToken: token,
    });
    if (!refreshToken) {
      throw new UnauthorizedException('User has been logged out.');
    }
    return refreshToken.userId;
  }

  async validateUser(jwtPayload: JwtPayload): Promise<any> {
    const user = await this.userModel.findOne({
      _id: jwtPayload.userId,
      verified: true,
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  // ***************************************************************************
  //                                 PRIVATE METHOD
  // ***************************************************************************

  private static getIp(req: Request): string {
    return getClientIp(req);
  }

  private static getBrowserInfo(req: Request): string {
    return req.header['user-agent'] || 'XX';
  }

  private static getCountry(req: Request): string {
    return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
  }

  private static buildJwtPayload(user: User): JwtPayload {
    return {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
    };
  }
}

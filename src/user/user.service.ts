import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { v4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { addHours } from 'date-fns';
import { VerifyUuidDto } from './dto/verify-uuid.dto';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';

@Injectable()
export class UserService {
  HOURS_TO_VERIFY = 4;
  HOURS_TO_BLOCK = 6;
  LOGIN_ATTEMPTS_TO_BLOCK = 5;

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    await this.isEmailUnique(user.email);
    this.setRegistrationInfo(user);
    await user.save();
    return UserService.buildRegistrationInfo(user);
  }

  async findAllUser(): Promise<User[]> {
    return await this.userModel.find();
  }

  async verifyEmail(req: Request, verifyUuidDto: VerifyUuidDto) {
    const user = await this.findByVerification(verifyUuidDto.verification);
    await UserService.setUserAsVerified(user);
    return {
      accessToken: await this.authService.createAccessToken(user),
      refreshToken: await this.authService.createRefreshToken(req, user._id),
    };
  }

  async login(req: Request, loginUserDto: LoginUserDto) {
    const user = await this.findUserByEmail(loginUserDto.email);
    UserService.isUserBlocked(user);
    await this.checkPassword(loginUserDto.password, user);
    await UserService.passwordsAreMatch(user);
    return {
      accessToken: await this.authService.createAccessToken(user),
      refreshToken: await this.authService.createRefreshToken(req, user._id),
    };
  }

  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    const userId = await this.authService.findRefreshToken(
      refreshAccessTokenDto.refreshToken,
    );
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('Bad request');
    }
    return {
      accessToken: await this.authService.createAccessToken(user),
    };
  }

  // ***************************************************************************
  //                                 PRIVATE METHOD
  // ***************************************************************************

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email, verified: true });
    if (!user) {
      throw new NotFoundException({ type: 'accountDoesNotExist' });
    }
    return user;
  }

  private static async passwordsAreMatch(user) {
    user.loginAttempts = 0;
    await user.save();
  }

  private async checkPassword(attemptPass: string, user) {
    const match = await bcrypt.compare(attemptPass, user.password);
    if (!match) {
      await this.passwordsDoNotMatch(user);
    }
    return match;
  }

  private async passwordsDoNotMatch(user) {
    user.loginAttempts += 1;
    await user.save();
    if (user.loginAttempts >= this.LOGIN_ATTEMPTS_TO_BLOCK) {
      await this.blockUser(user);
      throw new ConflictException({ type: 'userBlocked' });
    } else {
      throw new NotFoundException({
        type: 'wrongPassword',
        loginAttempts: user.loginAttempts,
      });
    }
  }

  private async blockUser(user) {
    user.blockExpires = addHours(new Date(), this.HOURS_TO_BLOCK);
    await user.save();
  }

  private static isUserBlocked(user) {
    if (user.blockExpires > Date.now()) {
      throw new ConflictException('User has been blocked try later.');
    }
  }

  private async findByVerification(verification: string): Promise<User> {
    const user = await this.userModel.findOne({
      verification,
      verified: false,
      verificationExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new BadRequestException('User is verified or not exist');
    }
    return user;
  }

  private static async setUserAsVerified(user) {
    user.verified = true;
    await user.save();
  }
  private setRegistrationInfo(user): any {
    user.verification = v4();
    user.verificationExpires = addHours(new Date(), this.HOURS_TO_VERIFY);
  }

  private static buildRegistrationInfo(user): any {
    return {
      fullName: user.fullName,
      email: user.email,
      verified: user.verified,
      verification: user.verification,
    };
  }

  private async isEmailUnique(email: string) {
    const user = await this.userModel.findOne({ email, verified: true });
    if (user) {
      throw new BadRequestException('Email already in use');
    }
  }
}

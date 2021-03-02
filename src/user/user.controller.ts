import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUuidDto } from './dto/verify-uuid.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request } from 'express';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@ApiBasicAuth()
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Register User' })
  @ApiCreatedResponse()
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('verify-email/:verification')
  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Verify Email' })
  @ApiOkResponse()
  async verifyEmail(@Req() req, @Param() verifyUuidDto: VerifyUuidDto) {
    return await this.userService.verifyEmail(req, verifyUuidDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Login User' })
  @ApiOkResponse({})
  async login(@Req() req: Request, @Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(req, loginUserDto);
  }

  @Post('refresh-access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Refresh Access Token with refresh token' })
  @ApiCreatedResponse({})
  async refreshAccessToken(
    @Body() refreshAccessTokenDto: RefreshAccessTokenDto,
  ) {
    return await this.userService.refreshAccessToken(refreshAccessTokenDto);
  }

  @Get('data')
  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @ApiOperation({ description: 'A private route for check the auth' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
  findAll() {
    return this.userService.findAllUser();
  }
}

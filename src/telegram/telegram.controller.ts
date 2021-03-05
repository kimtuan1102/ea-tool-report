import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('telegram')
@ApiTags('Telegram')
@ApiBearerAuth()
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Get('sync-telegram-account')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Sync telegram account' })
  @ApiOkResponse()
  async syncTelegramAccount() {
    return await this.telegramService.syncTelegramAccount();
  }
}

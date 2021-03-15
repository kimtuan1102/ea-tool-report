import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
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
  protected logger = new Logger(TelegramController.name);
  constructor(private telegramService: TelegramService) {}

  @Post('sync-telegram-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Sync telegram account' })
  @ApiOkResponse()
  async syncTelegramAccount(@Body() body) {
    if (body.message) {
      const accountId = body.message.text;
      const telegram = body.message.chat.id;
      return await this.telegramService.syncTelegramAccount({
        accountId,
        telegram,
      });
    }
    this.logger.log('Field message does not exist');
    return {
      ok: true,
    };
  }
}

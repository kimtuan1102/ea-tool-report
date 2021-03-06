import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
  constructor(private telegramService: TelegramService) {}

  @Post('sync-telegram-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Sync telegram account' })
  @ApiOkResponse()
  async syncTelegramAccount(@Body() body) {
    console.log(body)
    const accountId = body.message.text;
    const telegram = body.message.chat.id;
    return await this.telegramService.syncTelegramAccount({
      accountId,
      telegram,
    });
  }
}

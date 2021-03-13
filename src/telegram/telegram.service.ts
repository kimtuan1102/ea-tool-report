import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { TELEGRAM_TOKEN } from '../common/const';
import { CopyService } from '../copy/copy.service';
import { SyncTelegramAccountDto } from '../copy/dto/sync-telegram-account.dto';
@Injectable()
export class TelegramService {
  constructor(
    private httpService: HttpService,
    @Inject(forwardRef(() => CopyService))
    private copyService: CopyService,
  ) {}
  async sendMessage(chatId: string, message: string) {
    return await this.httpService
      .post(`https://api.telegram.org/${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: message,
      })
      .toPromise();
  }
  async syncTelegramAccount(syncTelegramDto: SyncTelegramAccountDto) {
    if (!isNaN(parseInt(syncTelegramDto.accountId))) {
      return await this.copyService.syncTelegramAccount(syncTelegramDto);
    }
    await this.sendMessage(
      syncTelegramDto.telegram,
      'Cảm ơn bạn, Tài khoản telegram của bạn đã được cập nhật',
    );
    return 'Success';
  }
}

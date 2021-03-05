import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { TELEGRAM_TOKEN } from '../common/const';
import * as _ from 'lodash';
import { CopyService } from '../copy/copy.service';
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
  async syncTelegramAccount() {
    const chatLogs = await this.httpService
      .get(`https://api.telegram.org/${TELEGRAM_TOKEN}/getUpdates`)
      .toPromise();
    let _chatLogs = chatLogs.data.result;
    _chatLogs = _.orderBy(_chatLogs, (item) => item.message.date, ['desc']);
    const syncTelegramsData = [];
    for (const chatLog of _chatLogs) {
      const chatId = chatLog.message.chat.id;
      const accountId = chatLog.message.text;
      if (accountId !== '/start') {
        syncTelegramsData.push({
          accountId: accountId,
          telegram: chatId,
        });
      }
    }
    return await this.copyService.syncTelegramAccount(syncTelegramsData);
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';
import { TELEGRAM_TOKEN } from '../common/const';

@Injectable()
export class TelegramService {
  constructor(private httpService: HttpService) {}
  async sendMessage(chatId: string, message: string) {
    return await this.httpService
      .post(`https://api.telegram.org/${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: message,
      })
      .toPromise();
  }
}

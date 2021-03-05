import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { CopyModule } from '../copy/copy.module';

@Module({
  imports: [forwardRef(() => CopyModule), HttpModule],
  providers: [TelegramService],
  exports: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}

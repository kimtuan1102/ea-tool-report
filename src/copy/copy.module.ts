import { forwardRef, Module } from '@nestjs/common';
import { CopyService } from './copy.service';
import { CopyController } from './copy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CopyToolReportSchema } from './schemas/copy-tool-report.schema';
import { ReportExcelsModule } from '../report-excels/report-excels.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CopyToolReport', schema: CopyToolReportSchema },
    ]),
    ReportExcelsModule,
    forwardRef(() => TelegramModule),
  ],
  providers: [CopyService],
  controllers: [CopyController],
  exports: [CopyService],
})
export class CopyModule {}

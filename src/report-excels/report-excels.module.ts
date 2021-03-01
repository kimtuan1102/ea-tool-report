import { Module } from '@nestjs/common';
import { ReportExcelsService } from './report-excels.service';

@Module({
  providers: [ReportExcelsService],
  exports: [ReportExcelsService],
})
export class ReportExcelsModule {}

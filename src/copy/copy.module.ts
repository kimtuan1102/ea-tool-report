import { Module } from '@nestjs/common';
import { CopyService } from './copy.service';
import { CopyController } from './copy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CopyToolReportSchema } from './schemas/copy-tool-report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CopyToolReport', schema: CopyToolReportSchema },
    ]),
  ],
  providers: [CopyService],
  controllers: [CopyController],
})
export class CopyModule {}

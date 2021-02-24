import { Injectable } from '@nestjs/common';
import { UpdateReportDto } from './dto/update-report.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CopyToolReport } from './interfaces/copy-tool-report.interface';

@Injectable()
export class CopyService {
  constructor(
    @InjectModel('CopyToolReport')
    private readonly copyToolReportModel: Model<CopyToolReport>,
  ) {}
  async updateReport(
    updateReportDto: UpdateReportDto,
  ): Promise<CopyToolReport> {
    const report = await this.copyToolReportModel.findOne({
      accountId: updateReportDto.accountId,
    });
    if (report) {
      updateReportDto.botOrder = report.botOrder + updateReportDto.botOrder;
      updateReportDto.selfOrder = report.selfOrder + updateReportDto.selfOrder;
    }
    return await this.copyToolReportModel.findOneAndUpdate(
      { accountId: updateReportDto.accountId },
      updateReportDto,
      {
        upsert: true,
      },
    );
  }
  async getAllReport() {
    return await this.copyToolReportModel.find();
  }
}

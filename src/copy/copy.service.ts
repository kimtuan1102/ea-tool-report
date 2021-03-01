import { Injectable, Res } from '@nestjs/common';
import { PushReportDto } from './dto/push-report.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CopyToolReport } from './interfaces/copy-tool-report.interface';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportExcelsService } from '../report-excels/report-excels.service';
import { Workbook } from 'exceljs';

@Injectable()
export class CopyService {
  constructor(
    @InjectModel('CopyToolReport')
    private readonly copyToolReportModel: Model<CopyToolReport>,
    private readonly reportExcelsService: ReportExcelsService,
  ) {}
  async pushReport(pushReportDto: PushReportDto): Promise<CopyToolReport> {
    const report = await this.copyToolReportModel.findOne({
      accountId: pushReportDto.accountId,
    });
    if (report) {
      pushReportDto.botOrder = report.botOrder + pushReportDto.botOrder;
      pushReportDto.selfOrder = report.selfOrder + pushReportDto.selfOrder;
    }
    return await this.copyToolReportModel.findOneAndUpdate(
      { accountId: pushReportDto.accountId },
      pushReportDto,
      {
        upsert: true,
      },
    );
  }
  async getAllReport(): Promise<CopyToolReport[]> {
    return await this.copyToolReportModel.find();
  }
  async updateReport(updateReportDto: UpdateReportDto) {
    return await this.copyToolReportModel.findOneAndUpdate(
      { accountId: updateReportDto.accountId },
      updateReportDto,
      { upsert: true, new: true },
    );
  }
  async resetReportData() {
    return await this.copyToolReportModel.updateMany(
      {},
      { selfOrder: 0, botOrder: 0, currentBalance: 0 },
      { new: true },
    );
  }
  async excelsReportData() {
    const reportData = await this.copyToolReportModel.find();
    return await this.reportExcelsService.eaToolReport(reportData);
  }
}

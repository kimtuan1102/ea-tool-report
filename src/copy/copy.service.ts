import { Injectable } from '@nestjs/common';
import { PushReportDto } from './dto/push-report.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CopyToolReport } from './interfaces/copy-tool-report.interface';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportExcelsService } from '../report-excels/report-excels.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { OptionsQueryDto } from '../common/dto/options-query.dto';
import { OptionsQuery } from '../common/interfaces/options.query';
import { ReportQuery } from './interfaces/report-query.interface';

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
  async getAllReport(query: ReportQueryDto): Promise<CopyToolReport[]> {
    const options = this.buildQueryOptions(query);
    const queryRp = this.buildQueryReport(query);
    return await this.copyToolReportModel.find(queryRp, options);
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
  async excelsReportData(query: ReportQueryDto) {
    const options = this.buildQueryOptions(query);
    const queryRp = this.buildQueryReport(query);
    const reportData = await this.copyToolReportModel.find(queryRp, options);
    console.log(reportData)
    return await this.reportExcelsService.eaToolReport(reportData);
  }
  // ***************************************************************************
  //                                 PRIVATE METHOD
  // ***************************************************************************
  private buildQueryOptions(query: OptionsQueryDto): OptionsQuery {
    if (!query.pageSize || query.pageSize < 0) {
      return {};
    } else {
      const page = query.page;
      const pageSize = query.pageSize;
      const skip = (page - 1) * pageSize;
      return {
        skip: skip,
        limit: pageSize,
      };
    }
  }
  private buildQueryReport(query: ReportQueryDto): ReportQuery {
    const queryRp = {};
    if (query.accountId) {
      const regexAccountId = new RegExp(`.*${query.accountId}.*`, 'i');
      Object.assign(queryRp, { accountId: regexAccountId });
    }
    if (query.telegram) {
      const regexTelegram = new RegExp(`.*${query.telegram}.*`, 'i');
      Object.assign(queryRp, { telegram: regexTelegram });
    }

    return queryRp;
  }
}

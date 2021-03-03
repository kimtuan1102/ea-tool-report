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
import { PushReportPayload } from './interfaces/push-report.interface';
import { UpdateFieldReportPayload } from './interfaces/update-field-report.interface';

@Injectable()
export class CopyService {
  constructor(
    @InjectModel('CopyToolReport')
    private readonly copyToolReportModel: Model<CopyToolReport>,
    private readonly reportExcelsService: ReportExcelsService,
  ) {}
  async pushReport(
    pushReportPayload: PushReportPayload,
  ): Promise<CopyToolReport> {
    const report = await this.copyToolReportModel.findOne({
      accountId: pushReportPayload.accountId,
    });
    if (report) {
      pushReportPayload.botOrder = report.botOrder + pushReportPayload.botOrder;
      pushReportPayload.selfOrder =
        report.selfOrder + pushReportPayload.selfOrder;
      pushReportPayload.dollar = this.calcDollar(
        report.initialBalance,
        pushReportPayload.currentBalance,
      );
      pushReportPayload.percent = this.calcPercent(
        report.initialBalance,
        pushReportPayload.currentBalance,
      );
    }
    return await this.copyToolReportModel.findOneAndUpdate(
      { accountId: pushReportPayload.accountId },
      pushReportPayload,
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
  async updateReport(updateReportPayload: UpdateFieldReportPayload) {
    const report = await this.copyToolReportModel.findOne({
      accountId: updateReportPayload.accountId,
    });
    if (report) {
      updateReportPayload.dollar = this.calcDollar(
        updateReportPayload.initialBalance,
        report.currentBalance,
      );
      updateReportPayload.percent = this.calcPercent(
        updateReportPayload.initialBalance,
        report.currentBalance,
      );
    }
    return await this.copyToolReportModel.findOneAndUpdate(
      { accountId: updateReportPayload.accountId },
      updateReportPayload,
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
    if (query.zalo) {
      const regexTelegram = new RegExp(`.*${query.zalo}.*`, 'i');
      Object.assign(queryRp, { zalo: regexTelegram });
    }

    return queryRp;
  }
  private calcDollar(balance0: number, balance1: number) {
    let dollar = 0;
    if (balance0 < 7000 && balance1 > balance0) {
      dollar = (balance1 - balance0 - 50) * 0.15;
    } else if (balance0 >= 7000 && balance0 < 10000 && balance1 > balance0) {
      dollar = (balance1 - balance0 - 100) * 0.15;
    } else if (balance0 >= 10000 && balance0 < 20000 && balance1 > balance0) {
      dollar = (balance1 - balance0 - 150) * 0.15;
    } else if (balance0 >= 20000 && balance1 > balance0) {
      dollar = (balance1 - balance0 - 200) * 0.15;
    }
    return Math.ceil(dollar);
  }
  private calcPercent(balance0: number, balance1: number) {
    return Math.ceil((balance1 / balance0) * 100 - 100);
  }
}

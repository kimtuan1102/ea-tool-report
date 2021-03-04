import { Injectable, Logger } from '@nestjs/common';
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
import { FilterType } from './enums/filter-type.enum';
import * as moment from 'moment';
import { SendMessageTelegramDto } from './dto/send-message-telegram.dto';
import * as format from 'string-format';
import { TelegramService } from '../telegram/telegram.service';
import { returnStatement } from '@babel/types';
@Injectable()
export class CopyService {
  protected logger = new Logger(CopyService.name);
  constructor(
    @InjectModel('CopyToolReport')
    private readonly copyToolReportModel: Model<CopyToolReport>,
    private readonly reportExcelsService: ReportExcelsService,
    private readonly telegramService: TelegramService,
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
  async getAllReport(query: FilterType): Promise<CopyToolReport[]> {
    return await this.getReportsByFilterType(query);
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
  async excelsReportData(query: FilterType) {
    const reportData = await this.getReportsByFilterType(query);
    return await this.reportExcelsService.eaToolReport(reportData);
  }

  async deleteReportByAccountId(accountId: string) {
    return await this.copyToolReportModel.findOneAndDelete({ accountId });
  }

  async sendMessageToTelegram(
    filterType: FilterType,
    sendMessageTelegramDto: SendMessageTelegramDto,
  ) {
    const reportData = await this.getReportsByFilterType(filterType);
    for (const _report of reportData) {
      if (_report.telegram && _report.telegram !== '') {
        const message = format(sendMessageTelegramDto.message, _report);
        this.telegramService
          .sendMessage(_report.telegram, message)
          .catch((e) => {
            this.logger.error(`Send Message Failed with error${e}`);
          });
      }
    }
    return 'Success';
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
  private async getReportsByFilterType(
    filterType: FilterType,
  ): Promise<CopyToolReport[]> {
    switch (filterType['filterType']) {
      case FilterType.ExpireLessThanSevenDay:
        return await this.copyToolReportModel.find({
          expireDate: { $lt: moment().add(7, 'd').toDate() },
        });
      case FilterType.SelfOrderOneTime:
        return await this.copyToolReportModel.find({ selfOrder: 1 });
      case FilterType.SelfOrderTwoTime:
        return await this.copyToolReportModel.find({ selfOrder: 2 });
      case FilterType.SelfOrderMoreThanTwoTime:
        return await this.copyToolReportModel.find({ selfOrder: { $gte: 3 } });
      case FilterType.All:
        return await this.copyToolReportModel.find();
      default:
        return await this.copyToolReportModel.find();
    }
  }
}

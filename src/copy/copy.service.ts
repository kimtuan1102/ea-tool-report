import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CopyToolReport } from './interfaces/copy-tool-report.interface';
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
import { SyncTelegramAccountDto } from './dto/sync-telegram-account.dto';
@Injectable()
export class CopyService {
  protected logger = new Logger(CopyService.name);
  constructor(
    @InjectModel('CopyToolReport')
    private readonly copyToolReportModel: Model<CopyToolReport>,
    private readonly reportExcelsService: ReportExcelsService,
    @Inject(forwardRef(() => TelegramService))
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
  async filterReport(
    filterType: FilterType,
    reportQueryDto: ReportQueryDto,
  ): Promise<CopyToolReport[]> {
    const query = this.buildQueryReport(filterType, reportQueryDto);
    const options = this.buildQueryOptions(reportQueryDto);
    let reportsData = await this.copyToolReportModel.find(query, options);
    reportsData = reportsData.map((item) => {
      item['_doc']['expireDateFormat'] = moment(item.expireDate).format(
        'DD/MM/YYYY',
      );
      return item;
    });
    return reportsData;
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
  async excelsReportData(
    filterType: FilterType,
    reportQueryDto: ReportQueryDto,
  ) {
    const reportData = await this.filterReport(filterType, reportQueryDto);
    return await this.reportExcelsService.eaToolReport(reportData);
  }

  async deleteReportByAccountId(accountId: string) {
    return await this.copyToolReportModel.findOneAndDelete({ accountId });
  }

  async sendMessageToTelegram(
    filterType: FilterType,
    reportQueryDto: ReportQueryDto,
    sendMessageTelegramDto: SendMessageTelegramDto,
  ) {
    const reportData = await this.filterReport(filterType, reportQueryDto);
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
  async syncTelegramAccount(syncTelegramsDto: SyncTelegramAccountDto[]) {
    const updatesQuery = [];
    for (const telegramDto of syncTelegramsDto) {
      updatesQuery.push({
        updateOne: {
          filter: { accountId: telegramDto.accountId },
          update: { telegram: telegramDto.telegram },
        },
      });
    }
    console.log(updatesQuery)
    return await this.copyToolReportModel.bulkWrite(updatesQuery);
  }
  // ***************************************************************************
  //                                 PRIVATE METHOD
  // ***************************************************************************
  private buildQueryOptions(
    reportQueryOptionsDto: OptionsQueryDto,
  ): OptionsQuery {
    if (!reportQueryOptionsDto.pageSize || reportQueryOptionsDto.pageSize < 0) {
      return {};
    } else {
      const page = reportQueryOptionsDto.page || 1;
      const pageSize = reportQueryOptionsDto.pageSize;
      const skip = (page - 1) * pageSize;
      return {
        skip: skip,
        limit: pageSize,
      };
    }
  }
  private buildQueryReport(
    filterType: FilterType,
    reportQueryDto: ReportQueryDto,
  ): ReportQuery {
    const queryRp = {};
    if (reportQueryDto.accountId) {
      const regexAccountId = new RegExp(`.*${reportQueryDto.accountId}.*`, 'i');
      Object.assign(queryRp, { accountId: regexAccountId });
    }
    switch (filterType['filterType']) {
      case FilterType.ExpireLessThanSevenDay:
        Object.assign(queryRp, {
          expireDate: { $lt: moment().add(7, 'd').toDate() },
        });
        break;
      case FilterType.SelfOrderOneTime:
        Object.assign(queryRp, { selfOrder: 1 });
        break;
      case FilterType.SelfOrderTwoTime:
        Object.assign(queryRp, { selfOrder: 2 });
        break;
      case FilterType.SelfOrderMoreThanTwoTime:
        Object.assign(queryRp, {
          selfOrder: { $gte: 3 },
        });
        break;
      case FilterType.All:
        break;
      default:
        break;
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
    return Math.ceil((balance1 / balance0) * 100 - 100)
      ? Math.ceil((balance1 / balance0) * 100 - 100)
      : 0;
  }
}

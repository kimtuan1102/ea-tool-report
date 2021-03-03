import { Injectable, Res } from '@nestjs/common';
import { CopyToolReport } from '../copy/interfaces/copy-tool-report.interface';
import { Workbook, Column, Alignment } from 'exceljs';
import { CopyToolReportExcels } from '../copy/interfaces/copy-tool-report-excels';

@Injectable()
export class ReportExcelsService {
  async eaToolReport(
    eaToolReportData: CopyToolReportExcels[],
  ): Promise<Workbook> {
    const workbook = this.buildExcelWorkBook();
    const worksheet = workbook.addWorksheet('Copy Tool Report');
    const headers = [
      { header: 'ID', key: 'accountId', width: 10 },
      { header: 'Balance 0', key: 'initialBalance', width: 15 },
      { header: 'Balance 1', key: 'currentBalance', width: 15 },
      { header: '%', key: 'percent', width: 15 },
      { header: '$', key: '$', width: 15 },
      { header: 'Bot', key: 'botOrder', width: 15 },
      { header: 'Tự đánh', key: 'selfOrder', width: 15 },
      { header: 'Zalo', key: 'zalo', width: 20 },
      { header: 'Deposit', key: 'deposit', width: 15 },
      { header: 'Withdraw', key: 'withdraw', width: 15 },
    ];
    worksheet.columns = headers as Column[];
    //Transform Data
    const eaToolReportExcels = eaToolReportData.map(
      (item: CopyToolReportExcels) => {
        const balance0 = item.initialBalance;
        const balance1 = item.currentBalance;
        let doLa = 0;
        if (balance0 < 7000 && balance1 > balance0) {
          doLa = (balance1 - balance0 - 50) * 0.15;
        } else if (
          balance0 >= 7000 &&
          balance0 < 10000 &&
          balance1 > balance0
        ) {
          doLa = (balance1 - balance0 - 100) * 0.15;
        } else if (
          balance0 >= 10000 &&
          balance0 < 20000 &&
          balance1 > balance0
        ) {
          doLa = (balance1 - balance0 - 150) * 0.15;
        } else if (balance0 >= 20000 && balance1 > balance0) {
          doLa = (balance1 - balance0 - 200) * 0.15;
        }
        item.dollar = Math.ceil(doLa);
        item.percent = Math.ceil(
          (item['currentBalance'] / item['initialBalance']) * 100 - 100,
        );
        return item;
      },
    );
    //Add data
    worksheet.addRows(eaToolReportExcels);
    //Style excels
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell(function (cell, colNumber) {
        cell.font = {
          name: 'Arial',
          family: 2,
          bold: false,
          size: 10,
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        if (rowNumber <= 1) {
          row.height = 20;
          cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4990e2' },
            bgColor: { argb: '4990e2' },
          };
        }
        if (rowNumber >= 1) {
          for (let i = 1; i <= headers.length; i++) {
            row.getCell(i).border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }
        }
      });
    });
    return workbook;
  }
  // ***************************************************************************
  //                                 PRIVATE METHOD
  // ***************************************************************************
  private buildExcelWorkBook() {
    const workbook = new Workbook();
    workbook.creator = 'SFX-capital';
    workbook.created = new Date();
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ];
    return workbook;
  }
}

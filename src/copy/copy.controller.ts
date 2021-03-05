import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CopyService } from './copy.service';
import { PushReportDto } from './dto/push-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportQueryDto } from './dto/report-query.dto';
import { FilterType } from './enums/filter-type.enum';
import { SendMessageTelegramDto } from './dto/send-message-telegram.dto';
import { CopyToolReport } from './interfaces/copy-tool-report.interface';

@ApiTags('Copy')
@Controller('copy')
@ApiBearerAuth()
export class CopyController {
  constructor(private readonly copyService: CopyService) {}

  @Post('update-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Update Report' })
  @ApiOkResponse()
  async pushReport(@Body() pushReportDto: PushReportDto) {
    return await this.copyService.pushReport(pushReportDto);
  }
  @Get('reports')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get All Report' })
  @ApiOkResponse()
  @ApiQuery({ name: 'filterType', enum: FilterType, required: false })
  async getAllReport(
    @Query() filterType: FilterType,
    @Query() reportQueryDto: ReportQueryDto,
  ): Promise<CopyToolReport[]> {
    return await this.copyService.filterReport(filterType, reportQueryDto);
  }
  @Post('update-report-fields')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Update report field' })
  async updateInitialBalance(@Body() updateReportDto: UpdateReportDto) {
    return await this.copyService.updateReport(updateReportDto);
  }
  @Post('reset-report-data')
  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Insert initial balance' })
  async resetReportData() {
    return await this.copyService.resetReportData();
  }
  @Get('excels-report-data')
  @HttpCode(HttpStatus.OK)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    'attachment; filename=' + 'SFX Copy Tool Report.xlsx',
  )
  @ApiOperation({ description: 'Report excels' })
  @ApiOkResponse()
  @ApiQuery({ name: 'filterType', enum: FilterType, required: false })
  async excelsReportData(
    @Res() res,
    @Query() filterType: FilterType,
    @Query() reportQueryDto: ReportQueryDto,
  ) {
    const workbook = await this.copyService.excelsReportData(
      filterType,
      reportQueryDto,
    );
    workbook.xlsx.write(res).then(() => {
      return res.end();
    });
  }
  @Delete('delete-report/:accountId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Delete report' })
  @ApiParam({ name: 'accountId', required: true, type: String })
  async deleteReport(@Param('accountId') accountId: string) {
    return this.copyService.deleteReportByAccountId(accountId);
  }
  @Post('send-message-telegram')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Send message to telegram' })
  @ApiQuery({ name: 'filterType', enum: FilterType, required: false })
  async sendMessageToTelegram(
    @Query() filterType: FilterType,
    @Query() reportQueryDto: ReportQueryDto,
    @Body() sendMessageTelegramDto: SendMessageTelegramDto,
  ) {
    return await this.copyService.sendMessageToTelegram(
      filterType,
      reportQueryDto,
      sendMessageTelegramDto,
    );
  }
}

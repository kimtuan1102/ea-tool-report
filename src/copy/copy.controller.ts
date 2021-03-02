import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CopyService } from './copy.service';
import { PushReportDto } from './dto/push-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';

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
  async getAllReport() {
    return await this.copyService.getAllReport();
  }
  @Post('update-report-fields')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Update report' })
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
  async excelsReportData(@Res() res) {
    const workbook = await this.copyService.excelsReportData();
    workbook.xlsx.write(res).then(() => {
      return res.end();
    });
  }
}

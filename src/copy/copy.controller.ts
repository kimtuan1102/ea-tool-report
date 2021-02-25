import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CopyService } from './copy.service';
import { UpdateReportDto } from './dto/update-report.dto';
import { UpdateInitialBalanceDto } from './dto/update-initial-balance.dto';

@ApiTags('Copy')
@Controller('copy')
export class CopyController {
  constructor(private readonly copyService: CopyService) {}

  @Post('update-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Update Report' })
  @ApiOkResponse()
  async updateReport(@Body() updateReportDto: UpdateReportDto) {
    return await this.copyService.updateReport(updateReportDto);
  }
  @Get('reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get All Report' })
  @ApiOkResponse()
  async getAllReport() {
    return await this.copyService.getAllReport();
  }
  @Post('update-initial-balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Update initial balance' })
  async updateInitialBalance(
    @Body() updateInitialBalanceDto: UpdateInitialBalanceDto,
  ) {
    return await this.copyService.updateInitialBalance(updateInitialBalanceDto);
  }
  @Post('reset-report-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Insert initial balance' })
  async resetReportData() {
    return await this.copyService.resetReportData();
  }
}

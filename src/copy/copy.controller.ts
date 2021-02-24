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
}

import { ApiProperty } from '@nestjs/swagger';
import { OptionsQueryDto } from '../../common/dto/options-query.dto';

export class ReportQueryDto extends OptionsQueryDto {
  @ApiProperty({ required: false })
  readonly accountId?: string;

  @ApiProperty({ required: false })
  readonly zalo?: string;
}

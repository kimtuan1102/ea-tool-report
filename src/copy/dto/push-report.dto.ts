import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class PushReportDto {
  @ApiModelProperty({
    example: '9000',
    description: 'The ID of account',
    format: 'string',
    maxLength: 255,
  })
  @IsNotEmpty()
  readonly accountId: string;

  @ApiModelProperty({
    example: 10,
    description: 'The number of self order',
  })
  public selfOrder: number;

  @ApiModelProperty({
    example: 10,
    description: 'The number of bot order',
  })
  public botOrder: number;

  @ApiModelProperty({
    example: '9000.2',
    description: 'The current balance of account',
    format: 'string',
    minLength: 5,
    maxLength: 1024,
  })
  @IsNotEmpty()
  readonly currentBalance: number;
}

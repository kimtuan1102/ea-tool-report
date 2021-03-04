import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty } from 'class-validator';

export class UpdateReportDto {
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
    description: 'Initial balance',
  })
  readonly initialBalance: number;

  @ApiModelProperty({
    example: 10,
    description: 'Deposit',
  })
  readonly deposit: number;

  @ApiModelProperty({
    example: 10,
    description: 'Withdraw',
  })
  readonly withdraw: number;

  @ApiModelProperty({
    example: 'Telegram Id',
    description: 'Telegram Id',
  })
  readonly telegram: string;

  @ApiModelProperty({
    description: 'expireDate',
  })
  readonly expireDate: Date;

  @ApiModelProperty({
    description: 'phone',
  })
  readonly phone: string;
}

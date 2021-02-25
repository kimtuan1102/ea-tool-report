import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty } from 'class-validator';

export class UpdateInitialBalanceDto {
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
}

import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyUuidDto {
  @ApiModelProperty({
    description: 'uuid to verify user',
    format: 'uuid',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly verification: string;
}

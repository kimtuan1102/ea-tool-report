import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty } from 'class-validator';

export class SendMessageTelegramDto {
  @ApiModelProperty({
    example: 'Hello',
    description: 'The message to send',
    format: 'string',
    maxLength: 1024,
  })
  @IsNotEmpty()
  readonly message: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class SyncTelegramAccountDto {
  @ApiProperty()
  readonly accountId: string;
  @ApiProperty()
  readonly telegram: string;
}

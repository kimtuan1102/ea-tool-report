import { ApiProperty } from '@nestjs/swagger';

export class OptionsQueryDto {
  @ApiProperty({ required: false })
  readonly page: number;

  @ApiProperty({ required: false })
  readonly pageSize: number;
}

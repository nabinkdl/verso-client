import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional({ description: 'Read up to and including this message id' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  messageId?: string;
}

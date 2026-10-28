import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Username of the person to message', example: 'jamiel' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Length(3, 30)
  username?: string;

  @ApiPropertyOptional({ description: 'User id of the person to message' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  userId?: string;
}

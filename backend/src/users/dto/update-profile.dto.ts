import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Morgan', maxLength: 80 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  name?: string;

  @ApiPropertyOptional({ example: 'Building things on the internet.', maxLength: 200 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200)
  bio?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string | null;
}

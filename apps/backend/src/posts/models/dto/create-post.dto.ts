import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MediaType } from '../../generated/prisma/client.js';

export class CreatePostDto {
  @ApiPropertyOptional({
    example: 'Welcome to the Verso Community!',
    maxLength: 2200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'A photo of the Verso team' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  imageAlt?: string;

  @ApiPropertyOptional({ example: 'https://example.com/clip.mp4' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;
}

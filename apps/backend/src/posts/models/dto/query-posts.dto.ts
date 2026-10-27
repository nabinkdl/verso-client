import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryPostsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Only return posts written by this username' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  author?: string;

  @ApiPropertyOptional({ description: 'Search post captions' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  q?: string;
}

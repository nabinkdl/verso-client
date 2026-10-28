import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({ example: 'See you at 6', maxLength: 4000 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Id of the message being replied to' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  replyToId?: string;
}

export class SendMessageBody extends SendMessageDto {
  @ApiProperty({ description: 'Conversation id' })
  @IsString()
  @MaxLength(50)
  conversationId!: string;
}

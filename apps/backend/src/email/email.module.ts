import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service.js';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('meta')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API metadata' })
  getInfo() {
    return {
      name: 'Mononet API',
      version: '0.1.0',
      status: 'ok',
      docs: '/docs',
    };
  }
}

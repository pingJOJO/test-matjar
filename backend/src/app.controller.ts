import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('System & Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'API Health & Status',
    description: 'Returns the operational health, version, and server timestamp of the AtoZ API',
  })
  @SwaggerResponse({
    status: 200,
    description: 'System is healthy and accepting traffic',
  })
  getSystemStatus() {
    return this.appService.getSystemStatus();
  }
}

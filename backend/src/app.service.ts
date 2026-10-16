import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      name: 'AtoZ Scalable E-Commerce API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      documentation: '/api/docs',
    };
  }
}

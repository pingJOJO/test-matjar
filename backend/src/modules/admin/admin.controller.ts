import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { QuickUpdateProductDto } from './dto/quick-update-product.dto.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Executive Analytics & KPI Overview (إحصائيات المبيعات والمخزون)',
    description:
      'Returns aggregate metrics: total revenue, order counts by status, urgent low-stock equipment parts, and recent field orders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Executive analytics overview retrieved successfully',
  })
  async getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('orders')
  @ApiOperation({
    summary: 'Field Orders Management (إدارة الطلبات الميدانية)',
    description:
      'List all contractor orders with filtering by OrderStatus, search by order number, contractor name, or tracking ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders list retrieved with pagination metadata',
  })
  async getOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Order Fulfillment Status (تحديث حالة الطلب)',
    description:
      'Transition order status (e.g. PROCESSING -> SHIPPED -> DELIVERED) with optional tracking number and warehouse notes.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  @Patch('products/:id/quick-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quick Stock & Price Patch (التعديل السريع للمخزون والأسعار)',
    description:
      'Instant patch for heavy equipment part pricing (sale price, cost price, compare-at) and physical stock without resubmitting full catalog attributes.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product pricing and inventory updated successfully',
  })
  async quickUpdateProduct(
    @Param('id') id: string,
    @Body() dto: QuickUpdateProductDto,
  ) {
    return this.adminService.quickUpdateProduct(id, dto);
  }

  @Get('invoices')
  @ApiOperation({
    summary: 'B2B Corporate & Tax Invoices (الفواتير الضريبية للشركات والمقاولين)',
    description:
      'Extract contractor orders containing company name, commercial registration, VAT number, cargo weight in kg, and ZATCA tax breakdown.',
  })
  @ApiResponse({
    status: 200,
    description: 'B2B corporate invoices retrieved successfully',
  })
  async getCorporateInvoices() {
    return this.adminService.getCorporateInvoices();
  }
}

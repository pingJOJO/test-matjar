import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { QueryOrdersDto } from './dto/query-orders.dto.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { SanitizedUser } from '../users/users.service.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session ID if purchasing without an account',
  })
  @ApiOperation({
    summary: 'Checkout Shopping Cart & Place Order',
    description:
      'Converts active shopping cart into an Order with PENDING status. ' +
      'Guarantees zero double-selling via PostgreSQL Transaction atomic stock reservation. ' +
      'Creates a 30-minute StockReservation to hold inventory until payment is completed.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'Order created and stock successfully reserved',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request: Empty cart or missing contact information',
  })
  @SwaggerResponse({
    status: 409,
    description: 'Conflict: Insufficient stock for one or more cart items',
  })
  async checkout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const sessionId = headerSessionId || dto.sessionId;
    return this.ordersService.checkout(
      dto,
      user?.id,
      sessionId,
      user?.email,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List User Orders',
    description: 'Retrieves paginated list of purchase orders for the logged-in customer.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'List of user orders',
  })
  async findAll(
    @Query() query: QueryOrdersDto,
    @CurrentUser() user: SanitizedUser,
  ) {
    const isAdmin = user.role === Role.ADMIN || user.role === Role.MANAGER;
    return this.ordersService.findAll(query, user.id, isAdmin);
  }

  @Get(':idOrOrderNumber')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Order Details by ID or Order Number',
    description: 'Fetches full order breakdown including line items, shipping address, and reservations.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Order details found',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Order not found',
  })
  async findOne(
    @Param('idOrOrderNumber') idOrOrderNumber: string,
    @CurrentUser() user: SanitizedUser | null,
  ) {
    const isAdmin =
      user?.role === Role.ADMIN || user?.role === Role.MANAGER;
    return this.ordersService.findByIdOrOrderNumber(
      idOrOrderNumber,
      user?.id,
      isAdmin,
    );
  }
}

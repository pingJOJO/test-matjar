import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { MergeCartDto } from './dto/merge-cart.dto.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { SanitizedUser } from '../users/users.service.js';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session identifier (for unauthenticated web visitors and mobile apps)',
  })
  @ApiOperation({
    summary: 'Get Shopping Cart',
    description:
      'Fetches current cart items, live stock availability, and calculated subtotals for either an authenticated user or guest session.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Cart details retrieved successfully',
  })
  async getCart(
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
    @Query('sessionId') querySessionId?: string,
  ) {
    const sessionId = headerSessionId || querySessionId;
    return this.cartService.getCartDetails(user?.id, sessionId);
  }

  @Post('items')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session identifier',
  })
  @ApiOperation({
    summary: 'Add Product to Cart',
    description:
      'Adds a product or increments quantity in the cart with inventory pre-validation.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'Product added to cart',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request: Insufficient stock or invalid quantity',
  })
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const sessionId = headerSessionId || dto.sessionId;
    return this.cartService.addItem(dto, user?.id, sessionId);
  }

  @Patch('items/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session identifier',
  })
  @ApiOperation({
    summary: 'Update Item Quantity',
    description: 'Updates quantity of a specific product in the cart.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Cart item quantity updated',
  })
  async updateItemQuantity(
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    const sessionId = headerSessionId || dto.sessionId;
    return this.cartService.updateItemQuantity(
      productId,
      dto.quantity,
      user?.id,
      sessionId,
    );
  }

  @Delete('items/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session identifier',
  })
  @ApiOperation({
    summary: 'Remove Item from Cart',
    description: 'Deletes a specific product line item from the cart.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Item removed from cart',
  })
  async removeItem(
    @Param('productId') productId: string,
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
    @Query('sessionId') querySessionId?: string,
  ) {
    const sessionId = headerSessionId || querySessionId;
    return this.cartService.removeItem(productId, user?.id, sessionId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Guest session identifier',
  })
  @ApiOperation({
    summary: 'Clear Entire Cart',
    description: 'Empties all items from the current active cart.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  async clearCart(
    @CurrentUser() user: SanitizedUser | null,
    @Headers('x-session-id') headerSessionId?: string,
    @Query('sessionId') querySessionId?: string,
  ) {
    const sessionId = headerSessionId || querySessionId;
    return this.cartService.clearCart(user?.id, sessionId);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Merge Guest Cart into User Cart',
    description:
      'Seamlessly merges guest session cart items into the authenticated user profile cart upon login.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Carts successfully merged',
  })
  async mergeCart(
    @Body() dto: MergeCartDto,
    @CurrentUser() user: SanitizedUser,
  ) {
    return this.cartService.mergeCart(dto.guestSessionId, user.id);
  }
}

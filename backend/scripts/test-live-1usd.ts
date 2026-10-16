import 'dotenv/config';
import { PaymentsService } from '../src/modules/payments/payments.service.js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/database/prisma.service.js';

async function main() {
  console.log('--- Testing Stripe Live 1.00 USD Flow ---');
  const cs = new ConfigService();
  const ps = new PaymentsService(new PrismaService(), cs);

  // 1. Prepare Order
  const prep = await ps.prepareLive1UsdOrder();
  console.log('1. Prepared Order:', prep);

  // 2. Create Live PaymentIntent
  const pi = await ps.createPaymentIntent({
    orderId: prep.orderId,
    provider: 'STRIPE' as any,
  });

  console.log('2. Live PaymentIntent Created:');
  console.log('   - Order ID:', pi.orderId);
  console.log('   - Amount:', pi.amount, pi.currency);
  console.log('   - Client Secret:', pi.clientSecret ? `${pi.clientSecret.slice(0, 25)}...` : 'NONE');

  // 3. Check status
  const status = await ps.getPaymentStatus(prep.orderId);
  console.log('3. Order Status:', status);
  console.log('--- TEST PASSED SUCCESSFULLY ---');
}

main().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});

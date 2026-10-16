import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  let email = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1].trim();
    } else if (arg === '--email' && args[i + 1]) {
      email = args[i + 1].trim();
      i++;
    } else if (!arg.startsWith('-') && !email) {
      email = arg.trim();
    }
  }

  if (!email) {
    console.error('Error: Email argument is required.');
    console.log('Usage: npm run user:make-admin -- --email=myemail@gmail.com');
    console.log('\nRecent users in database:');
    try {
      const recentUsers = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true, lastName: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      console.table(recentUsers);
    } catch {
      // Ignored
    }
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    console.error(`User with email "${normalizedEmail}" was not found in database.`);
    console.log('Please register or log in first, then run this command again.');
    process.exit(1);
  }

  if (user.role === Role.ADMIN) {
    console.log(`User "${normalizedEmail}" is already an ADMIN.`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
  });

  console.log(`[SUCCESS] User "${updated.email}" (ID: ${updated.id}) role updated to ADMIN.`);
}

main()
  .catch((err) => {
    console.error('Failed to promote user to ADMIN:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

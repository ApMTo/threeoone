import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../src/generated/prisma/client';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env for seed: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const databaseUrl = requiredEnv('DATABASE_URL');
  const email = requiredEnv('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnv('ADMIN_PASSWORD');
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'Admin';
  const dateOfBirth = process.env.ADMIN_DATE_OF_BIRTH?.trim() || '1990-01-01';

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash,
        role: UserRole.admin,
      },
      create: {
        email,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash,
        role: UserRole.admin,
      },
    });

    console.log(`Admin user ready: ${admin.email} (${admin.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

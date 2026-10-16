import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';

export type SanitizedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly inMemoryUsers = new Map<string, User>();

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    if (!this.prisma.isConnected) {
      return this.inMemoryUsers.get(id) || null;
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return user || this.inMemoryUsers.get(id) || null;
    } catch {
      return this.inMemoryUsers.get(id) || null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    if (!this.prisma.isConnected) {
      for (const u of this.inMemoryUsers.values()) {
        if (u.email === normalized) return u;
      }
      return null;
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: normalized },
      });
      if (user) return user;
      for (const u of this.inMemoryUsers.values()) {
        if (u.email === normalized) return u;
      }
      return null;
    } catch {
      for (const u of this.inMemoryUsers.values()) {
        if (u.email === normalized) return u;
      }
      return null;
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const email = data.email.toLowerCase().trim();
    if (!this.prisma.isConnected) {
      const user: User = {
        id: randomUUID(),
        email,
        passwordHash: data.passwordHash || '',
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
        isEmailVerified: data.isEmailVerified || false,
        emailVerifiedAt: data.emailVerifiedAt ? new Date(data.emailVerifiedAt as any) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryUsers.set(user.id, user);
      this.logger.log(`Created in-memory user: ${user.email} (${user.id})`);
      return user;
    }

    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          email,
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to create user in database, falling back to memory: ${(e as Error).message}`);
      const user: User = {
        id: randomUUID(),
        email,
        passwordHash: data.passwordHash || '',
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
        isEmailVerified: data.isEmailVerified || false,
        emailVerifiedAt: data.emailVerifiedAt ? new Date(data.emailVerifiedAt as any) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryUsers.set(user.id, user);
      return user;
    }
  }

  sanitizeUser(user: User): SanitizedUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}


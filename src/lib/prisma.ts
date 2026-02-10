import { PrismaClient } from '@/generated/prisma/client';

const prismaClient = new PrismaClient(undefined as any);

export { prismaClient as prisma };

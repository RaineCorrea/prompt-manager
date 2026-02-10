import { PrismaClient } from '@/generated/prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaClient = new PrismaClient(undefined as any);

export { prismaClient as prisma };

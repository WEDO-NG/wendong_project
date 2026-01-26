import { PrismaClient } from '@prisma/client';

// 扩展全局对象类型，防止 TS 报错
const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

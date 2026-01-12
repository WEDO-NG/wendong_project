import { PrismaClient } from '@prisma/client';

// 暂时只初始化，不强制连接，避免没有数据库导致报错
const prisma = new PrismaClient();

export default prisma;

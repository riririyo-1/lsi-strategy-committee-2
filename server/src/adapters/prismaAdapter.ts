import { PrismaClient } from "@prisma/client";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

export default prisma;
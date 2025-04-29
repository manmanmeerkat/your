// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient は Node.js のグローバル変数に格納して、
// 接続インスタンスの重複作成を防ぐ
const prismaGlobal = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = 
  prismaGlobal.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 接続プールを共有するために開発環境ではグローバル変数にキャッシュする
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

// アプリケーション終了時に接続を閉じる
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
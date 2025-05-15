import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 初期接続を管理する関数
async function initPrismaClient() {
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty'
  });

  // 複数回の接続試行を実装
  let connected = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!connected && attempts < maxAttempts) {
    try {
      await client.$disconnect(); // 念のため既存の接続を切断
      await client.$connect();
      connected = true;
      console.log('Prisma接続成功');
    } catch (error) {
      attempts++;
      console.error(`Prisma接続試行 ${attempts}/${maxAttempts} 失敗:`, error);
      
      if (attempts >= maxAttempts) {
        console.error('Prisma接続失敗: 最大試行回数に達しました');
        // 接続失敗でもクライアントは返す（後で再試行の可能性あり）
        break;
      }
      
      // 再試行前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return client;
}

// シングルトンパターンの実装
let prismaInstance: PrismaClient | undefined;

if (process.env.NODE_ENV === 'production') {
  // 本番環境では毎回新しいインスタンスを初期化
  prismaInstance = global.prisma;
  if (!prismaInstance) {
    prismaInstance = initPrismaClient() as any; // Promise<PrismaClient>をPrismaClientとして扱う
    global.prisma = prismaInstance;
  }
} else {
  // 開発環境ではグローバルインスタンスを使用
  if (!global.prisma) {
    global.prisma = initPrismaClient() as any;
  }
  prismaInstance = global.prisma;
}

export default prismaInstance;
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // 管理者ページへのアクセスをチェック
  if (req.nextUrl.pathname.startsWith('/admin') && 
      !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      // ログイン状態をコンソールに出力（デバッグ用）
      console.log('未認証アクセス:', req.nextUrl.pathname);
      
      // API リクエストの場合は JSON レスポンスを返す
      if (req.nextUrl.pathname.startsWith('/api/admin/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // 通常ページの場合はリダイレクト
      const redirectUrl = new URL('/admin/login', req.url);
      redirectUrl.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// このミドルウェアを適用するパス - 公開APIは除外
export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*'  // 管理者用APIのみにマッチ
  ],
};
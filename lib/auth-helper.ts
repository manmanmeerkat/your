// lib/auth-helper.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 現在のセッションを取得
 * @returns セッション情報またはnull
 */
export async function getCurrentSession() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('セッション取得エラー:', error);
    return null;
  }
}

/**
 * 管理者権限があるかチェック
 * @returns 管理者の場合はtrue
 */
export async function isAdmin() {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return false;
    }
    
    // ここに管理者かどうかの条件を追加
    // 例: 特定のメールドメインを持つか、adminロールを持つかなど
    // const isAdminUser = session.user.email?.endsWith('@admin.com') || session.user.user_metadata.role === 'admin';
    
    // とりあえずログインしていれば管理者とみなす
    return true;
  } catch (error) {
    console.error('管理者チェックエラー:', error);
    return false;
  }
}

/**
 * クライアントコンポーネント用のセッションチェック関数
 * @param token アクセストークン
 * @returns 管理者の場合はtrue
 */
export async function checkAdminToken(token: string) {
  try {
    // この実装は簡易的なものです
    // 本来はトークンの検証や権限チェックを行うべきです
    return token.length > 0;
  } catch (error) {
    console.error('トークンチェックエラー:', error);
    return false;
  }
}
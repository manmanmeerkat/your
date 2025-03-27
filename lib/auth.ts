import { createClient } from '@supabase/supabase-js';

// 管理者権限チェック関数
export async function isAdmin(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        persistSession: false,
      }
    }
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return false;
  }
  
  // 管理者メールアドレスのリスト
  const adminEmails = ['enoki.inc@gmail.com']; // 実際の管理者メールを設定してください
  return adminEmails.includes(user.email || '');
}

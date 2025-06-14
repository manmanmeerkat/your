// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 認証チェックを一時的に無効化（テスト用）
    // const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    // if (!token || !(await isAdmin(token))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileArray = new Uint8Array(fileBuffer);
    
    // ファイル名を現在時刻 + オリジナルファイル名で設定
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Supabaseストレージにアップロード
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    console.log('Uploading to Supabase Storage...');
    console.log('Bucket:', 'images');
    console.log('Filename:', fileName);
    
    const { error } = await supabase
      .storage
      .from('images')
      .upload(fileName, fileArray, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase Storage Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 画像のURLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(fileName);
    
    console.log('Upload successful, public URL:', publicUrl);
    
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
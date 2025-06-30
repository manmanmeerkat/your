// app/api/images/route.ts - 認証修正版
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// 🔐 サーバー側認証チェック関数
async function checkAuth() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔍 API認証チェック:', {
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message,
      expiresAt: session?.expires_at
    });

    if (error) {
      console.log('❌ 認証エラー:', error.message);
      return { success: false, error: `認証エラー: ${error.message}` };
    }

    if (!session) {
      console.log('❌ セッションなし');
      return { success: false, error: '認証セッションがありません' };
    }

    // セッションの有効期限チェック
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      console.log('❌ セッション期限切れ');
      return { success: false, error: '認証セッションが期限切れです' };
    }

    console.log('✅ 認証成功:', session.user.email);
    return { success: true, session };
  } catch (error) {
    console.error('💥 認証チェック例外:', error);
    return { success: false, error: `認証チェック中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// 📖 画像一覧取得
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/images 呼び出し');

    // URLパラメータから articleId を取得
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      console.log('❌ articleId パラメータがありません');
      return NextResponse.json({ error: 'articleId が必要です' }, { status: 400 });
    }

    console.log('📊 取得対象 Article ID:', articleId);

    // 🔐 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 📊 画像一覧を取得
    const images = await prisma.image.findMany({
      where: {
        articleId: articleId,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        url: true,
        altText: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    console.log('✅ 画像取得成功:', images.length, '枚');

    return NextResponse.json({ images });
  } catch (error) {
    console.error('❌ 画像取得エラー:', error);
    return NextResponse.json(
      { error: '画像の取得に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 📤 画像アップロード
export async function POST(request: NextRequest) {
  try {
    console.log('📤 POST /api/images 呼び出し');

    // 🔐 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 📂 フォームデータ取得
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const altText = formData.get('altText') as string;
    const articleId = formData.get('articleId') as string;

    console.log('📊 アップロード情報:', {
      fileName: file?.name,
      fileSize: file?.size,
      altText,
      articleId,
    });

    if (!file) {
      console.log('❌ ファイルなし');
      return NextResponse.json({ error: '画像ファイルが必要です' }, { status: 400 });
    }

    if (!articleId) {
      console.log('❌ articleId なし');
      return NextResponse.json({ error: 'articleId が必要です' }, { status: 400 });
    }

    // 📝 記事の存在確認
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true },
    });

    if (!article) {
      console.log('❌ 記事が見つからない:', articleId);
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    console.log('✅ 記事確認OK:', article.slug);

    // ✅ ファイル検証
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ ファイルサイズ超過:', file.size);
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます (最大10MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ ファイル形式不正:', file.type);
      return NextResponse.json({ error: 'サポートされていない画像形式です' }, { status: 400 });
    }

    console.log('✅ ファイル検証OK');

    // 💾 ファイル保存
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${randomUUID()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', 'images', 'articles', articleId);
    
    console.log('📁 アップロードディレクトリ:', uploadDir);

    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    console.log('✅ ファイル保存成功:', filePath);

    // 🌐 公開URL生成
    const imageUrl = `/images/articles/${articleId}/${fileName}`;

    // 🔍 アップロード前のフィーチャー画像状態を確認
    const existingFeaturedImages = await prisma.image.findMany({
      where: {
        articleId: articleId,
        isFeatured: true,
      },
      select: {
        id: true,
        url: true,
        altText: true,
      },
    });
    console.log('📊 アップロード前のフィーチャー画像:', existingFeaturedImages.length, '枚');

    // 💽 データベースに保存
    const image = await prisma.image.create({
      data: {
        articleId: articleId,
        url: imageUrl,
        altText: altText || file.name.replace(/\.[^/.]+$/, ''),
        isFeatured: false,
      },
      select: {
        id: true,
        url: true,
        altText: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    console.log('✅ データベース保存成功:', image.id);

    // 🔍 アップロード後のフィーチャー画像状態を確認
    const updatedFeaturedImages = await prisma.image.findMany({
      where: {
        articleId: articleId,
        isFeatured: true,
      },
      select: {
        id: true,
        url: true,
        altText: true,
      },
    });
    console.log('📊 アップロード後のフィーチャー画像:', updatedFeaturedImages.length, '枚');

    return NextResponse.json({ 
      message: '画像がアップロードされました',
      image 
    });
  } catch (error) {
    console.error('❌ 画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 🔧 画像更新
export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 PUT /api/images 呼び出し');

    // 🔐 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const articleId = searchParams.get('articleId');

    if (!imageId || !articleId) {
      return NextResponse.json({ error: 'imageId と articleId が必要です' }, { status: 400 });
    }

    const { altText, isFeatured } = await request.json();

    const existingImage = await prisma.image.findFirst({
      where: {
        id: imageId,
        articleId: articleId,
      },
    });

    if (!existingImage) {
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }

    // フィーチャー画像設定時は他を解除
    if (isFeatured === true) {
      await prisma.image.updateMany({
        where: {
          articleId: articleId,
          id: { not: imageId },
        },
        data: {
          isFeatured: false,
        },
      });
    }

    const updateData: { altText?: string; isFeatured?: boolean } = {};
    if (altText !== undefined) updateData.altText = altText;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: updateData,
      select: {
        id: true,
        url: true,
        altText: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    console.log('✅ 画像更新成功:', imageId);

    return NextResponse.json({ 
      message: '画像情報が更新されました',
      image: updatedImage 
    });
  } catch (error) {
    console.error('❌ 画像更新エラー:', error);
    return NextResponse.json(
      { error: '画像の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 🗑️ 画像削除
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/images 呼び出し');

    // 🔐 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const articleId = searchParams.get('articleId');

    if (!imageId || !articleId) {
      return NextResponse.json({ error: 'imageId と articleId が必要です' }, { status: 400 });
    }

    const existingImage = await prisma.image.findFirst({
      where: {
        id: imageId,
        articleId: articleId,
      },
    });

    if (!existingImage) {
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }

    // ファイル削除
    try {
      const imagePath = join(process.cwd(), 'public', existingImage.url);
      await unlink(imagePath);
      console.log('✅ ファイル削除成功:', imagePath);
    } catch (fileError) {
      console.warn('⚠️ ファイル削除エラー（続行）:', fileError);
    }

    // データベースから削除
    await prisma.image.delete({ where: { id: imageId } });

    console.log('✅ 画像削除成功:', imageId);

    return NextResponse.json({ message: '画像が削除されました' });
  } catch (error) {
    console.error('❌ 画像削除エラー:', error);
    return NextResponse.json(
      { error: '画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}
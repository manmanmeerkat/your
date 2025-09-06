// app/api/images/route.ts - フィーチャー切り替え対応版
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// サーバー側認証チェック関数
async function checkAuth() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('認証チェック:', {
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message,
      expiresAt: session?.expires_at
    });

    if (error) {
      console.log('認証エラー:', error.message);
      return { success: false, error: `認証エラー: ${error.message}` };
    }

    if (!session) {
      console.log('セッションなし');
      return { success: false, error: '認証セッションがありません' };
    }

    // セッションの有効期限チェック
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      console.log('セッション期限切れ');
      return { success: false, error: '認証セッションが期限切れです' };
    }

    console.log('認証成功:', session.user.email);
    return { success: true, session };
  } catch (error) {
    console.error('認証チェック例外:', error);
    return { success: false, error: `認証チェック中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// 画像一覧取得
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/images 呼び出し');

    // URLパラメータから articleId を取得
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      console.log('articleId パラメータがありません');
      return NextResponse.json({ error: 'articleId が必要です' }, { status: 400 });
    }

    console.log('取得対象 Article ID:', articleId);

    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 画像一覧を取得
    const images = await prisma.image.findMany({
      where: {
        articleId: articleId,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'asc' }, // 作成日時の昇順（古いものが先）
      ],
      select: {
        id: true,
        url: true,
        altText: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    console.log('画像取得成功:', images.length, '枚');

    return NextResponse.json({ images });
  } catch (error) {
    console.error('画像取得エラー:', error);
    return NextResponse.json(
      { error: '画像の取得に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 画像アップロード（Supabase Storage対応）
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/images 呼び出し');

    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // フォームデータ取得
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const altText = formData.get('altText') as string;
    const articleId = formData.get('articleId') as string;
    const isFeatured = formData.get('isFeatured') === 'true';

    console.log('アップロード情報:', {
      fileName: file?.name,
      fileSize: file?.size,
      altText,
      articleId,
      isFeatured,
    });

    if (!file) {
      console.log('ファイルなし');
      return NextResponse.json({ error: '画像ファイルが必要です' }, { status: 400 });
    }

    if (!articleId) {
      console.log('articleId なし');
      return NextResponse.json({ error: 'articleId が必要です' }, { status: 400 });
    }

    // 記事の存在確認
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true },
    });

    if (!article) {
      console.log('記事が見つからない:', articleId);
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    console.log('記事確認OK:', article.slug);

    // ファイル検証
    if (file.size > 10 * 1024 * 1024) {
      console.log('ファイルサイズ超過:', file.size);
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます (最大10MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('ファイル形式不正:', file.type);
      return NextResponse.json({ error: 'サポートされていない画像形式です' }, { status: 400 });
    }

    console.log('ファイル検証OK');

    // Supabase Storageにアップロード
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${articleId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    console.log('Supabase Storage アップロード:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage アップロードエラー:', uploadError);
      return NextResponse.json({ 
        error: '画像のアップロードに失敗しました', 
        details: uploadError.message 
      }, { status: 500 });
    }

    console.log('Supabase Storage アップロード成功:', uploadData.path);

    // 公開URL生成
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    console.log('公開URL生成:', publicUrl);

    // アップロード前のフィーチャー画像状態を確認
    const existingFeaturedImages = await prisma.image.findMany({
      where: {
        articleId: articleId,
        isFeatured: true,
      },
      select: {
        id: true,
        isFeatured: true,
      },
    });

    console.log('既存フィーチャー画像数:', existingFeaturedImages.length);

    // フィーチャー画像の処理
    if (isFeatured && existingFeaturedImages.length > 0) {
      // 既存のフィーチャー画像を非フィーチャーに変更
      await prisma.image.updateMany({
        where: {
          articleId: articleId,
          isFeatured: true,
        },
        data: {
          isFeatured: false,
        },
      });
      console.log('既存フィーチャー画像を非フィーチャーに変更');
    }

    // データベースに画像情報を保存
    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        altText: altText || file.name.replace(/\.[^/.]+$/, ''),
        isFeatured: isFeatured,
        articleId: articleId,
      },
      select: {
        id: true,
        url: true,
        altText: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    console.log('データベース保存成功:', {
      imageId: image.id,
      isFeatured: image.isFeatured,
    });

    return NextResponse.json({
      success: true,
      image,
      message: isFeatured
        ? '画像をアップロードし、フィーチャー画像に設定しました'
        : '画像をアップロードしました',
    });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 画像更新（フィーチャー切り替え対応）
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/images 呼び出し');

    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // URLパラメータの確認
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const articleId = searchParams.get('articleId');

    const body = await request.json();
    const { isFeatured, altText } = body;

    if (!imageId) {
      return NextResponse.json({ error: 'imageId が必要です' }, { status: 400 });
    }

    if (!articleId) {
      return NextResponse.json({ error: 'articleId が必要です' }, { status: 400 });
    }

    console.log('フィーチャー切り替え処理:', { imageId, articleId, isFeatured, altText });

    // 画像の存在確認
    const existingImage = await prisma.image.findUnique({
      where: { id: imageId },
      select: { 
        id: true, 
        articleId: true, 
        isFeatured: true,
        altText: true,
        url: true,
      },
    });

    if (!existingImage) {
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }

    // 記事IDの一致確認
    if (existingImage.articleId !== articleId) {
      return NextResponse.json({ error: '画像と記事の関連が正しくありません' }, { status: 400 });
    }

    // フィーチャー画像の処理
    if (isFeatured !== undefined) {
      if (isFeatured) {
        // 新しくフィーチャー画像に設定する場合
        console.log('フィーチャー画像に設定:', imageId);

        // 同じ記事の他のフィーチャー画像を解除
        await prisma.image.updateMany({
          where: {
            articleId: articleId,
            isFeatured: true,
            id: { not: imageId }, // 対象画像以外
          },
          data: {
            isFeatured: false,
          },
        });
        console.log('他のフィーチャー画像を解除');
      } else {
        // フィーチャー画像を解除する場合
        console.log('フィーチャー画像を解除:', imageId);
      }
    }

    // 画像情報を更新
    const updateData: { isFeatured?: boolean; altText?: string } = {};
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
    if (altText !== undefined) {
      updateData.altText = altText;
    }

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

    console.log('画像更新成功:', {
      imageId: updatedImage.id,
      isFeatured: updatedImage.isFeatured,
    });

    // 更新後の状況を確認
    const totalImages = await prisma.image.count({
      where: { articleId: articleId },
    });

    const featuredCount = await prisma.image.count({
      where: { 
        articleId: articleId,
        isFeatured: true,
      },
    });

    return NextResponse.json({
      success: true,
      image: updatedImage,
      message: isFeatured 
        ? 'フィーチャー画像に設定しました'
        : isFeatured === false
        ? 'フィーチャー画像を解除しました'
        : '画像を更新しました',
      summary: {
        totalImages,
        featuredImages: featuredCount,
      },
    });
  } catch (error) {
    console.error('画像更新エラー:', error);
    return NextResponse.json(
      { error: '画像の更新に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 画像削除（Supabase Storage対応）
export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/images 呼び出し');

    // 認証チェック
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

    console.log('削除対象:', { imageId, articleId });

    // 画像の存在確認
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true, url: true, isFeatured: true, articleId: true },
    });

    if (!image) {
      return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 });
    }

    // 記事IDの一致確認
    if (image.articleId !== articleId) {
      return NextResponse.json({ error: '画像と記事の関連が正しくありません' }, { status: 400 });
    }

    // Supabase Storageからファイル削除
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // URLからファイルパスを抽出
      const urlParts = image.url.split('/');
      const fileName = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

      const { error: deleteError } = await supabase.storage
        .from('article-images')
        .remove([fileName]);

      if (deleteError) {
        console.error('Supabase Storage 削除エラー:', deleteError);
      } else {
        console.log('Supabase Storage ファイル削除成功:', fileName);
      }
    } catch (storageError) {
      console.error('ストレージ削除エラー:', storageError);
    }

    // データベースから削除
    await prisma.image.delete({
      where: { id: imageId },
    });

    console.log('データベース削除成功');

    // フィーチャー画像が削除された場合の処理
    if (image.isFeatured) {
      const remainingImages = await prisma.image.findMany({
        where: { articleId },
        orderBy: { createdAt: 'asc' }, // 古いものから順番
        take: 1,
      });

      if (remainingImages.length > 0) {
        await prisma.image.update({
          where: { id: remainingImages[0].id },
          data: { isFeatured: true },
        });
        console.log('新しいフィーチャー画像を設定:', remainingImages[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      message: '画像を削除しました',
    });
  } catch (error) {
    console.error('画像削除エラー:', error);
    return NextResponse.json(
      { error: '画像の削除に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
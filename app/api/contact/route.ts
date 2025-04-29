// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // バリデーション
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { success: false, message: '必須項目が入力されていません。' }, 
        { status: 400 }
      );
    }
    
    // データベースに保存
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'unread'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'お問い合わせを受け付けました。' 
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'エラーが発生しました。後でもう一度お試しください。' }, 
      { status: 500 }
    );
  }
}

// GET, PUT, PATCH, DELETEなど他のメソッドに対するレスポンスも定義
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
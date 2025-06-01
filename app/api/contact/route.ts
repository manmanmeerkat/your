// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request' },
        { status: 400 }
      );
    }
    
    console.log('Received contact form data:', data);
    
    // バリデーション
    if (!data.name || !data.email || !data.subject || !data.message) {
      console.log('Validation failed:', { data });
      return NextResponse.json(
        { success: false, message: 'Required fields are missing.' }, 
        { status: 400 }
      );
    }
    
    try {
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
      
      console.log('Contact message created successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Thank you for your inquiry. We have received your message.' 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'We’re sorry, a database error has occurred. Please try again later.', 
          error: dbError instanceof Error ? dbError.message : String(dbError)
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "We're sorry, something went wrong. Please try again later.",
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// 他のHTTPメソッドへの対応は同じ
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tag, path } = await request.json();
    
    console.log('Revalidate API called with:', { tag, path });
    
    if (tag) {
      revalidateTag(tag);
      console.log(`Successfully revalidated tag: ${tag}`);
    }
    
    if (path) {
      revalidatePath(path);
      console.log(`Successfully revalidated path: ${path}`);
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      tag: tag || null, 
      path: path || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Revalidation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
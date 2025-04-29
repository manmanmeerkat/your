// app/api/contact/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // 修正: prismaの正しいインポート

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    if (!['read', 'unread'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }
    
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
}
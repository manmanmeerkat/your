// app/api/article-counts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ダミーのレスポンスを返す
  return NextResponse.json({
    counts: {
      culture: 0,
      mythology: 0,
      customs: 0,
      festivals: 0
    }
  });
}
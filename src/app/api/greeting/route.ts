import { NextResponse } from 'next/server'

// 稳定版问候端点
// 当未命中灰度条件时，/api/greeting 由本端点处理
export async function GET() {
  return NextResponse.json({
    channel: 'stable',
    message: 'Hello from the STABLE release!',
    timestamp: new Date().toISOString(),
    via: '/api/greeting',
  })
}

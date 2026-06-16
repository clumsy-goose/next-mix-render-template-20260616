import { NextResponse } from 'next/server'

// 灰度(beta)版问候端点
// 用于验证 beforeFiles 条件 rewrite:
//   当请求带 header `x-canary: always` 或 cookie `canary=true` 时，
//   /api/greeting 会被内部重写到 /api/beta/greeting（URL 不变）
export async function GET() {
  return NextResponse.json({
    channel: 'beta',
    message: 'Hello from the BETA (canary) release!',
    experimental: true,
    timestamp: new Date().toISOString(),
    via: '/api/beta/greeting',
  })
}

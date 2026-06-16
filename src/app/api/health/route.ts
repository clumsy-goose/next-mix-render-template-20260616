import { NextResponse } from 'next/server'

// 健康检查端点
// 用于验证 afterFiles rewrite: /healthz -> /api/health
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'next-mix-template',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    via: '/api/health',
  })
}

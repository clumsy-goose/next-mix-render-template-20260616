import { NextResponse } from 'next/server'

// 版本化状态端点 (v2)
// 用于验证 afterFiles rewrite: /status -> /api/v2/status
export async function GET() {
  return NextResponse.json({
    apiVersion: 'v2',
    status: 'operational',
    features: ['rewrites', 'redirects', 'canary', 'proxy'],
    timestamp: new Date().toISOString(),
    via: '/api/v2/status',
  })
}

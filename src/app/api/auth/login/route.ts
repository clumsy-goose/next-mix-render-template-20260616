import { NextResponse } from 'next/server'

// 登录引导端点
// 用于验证基于 cookie 缺失的条件重定向:
//   访问 /account/* 且缺少 `session` cookie 时，重定向到此端点
export async function GET() {
  return NextResponse.json({
    authenticated: false,
    message: 'No active session. Please log in.',
    loginHint: 'Set a `session` cookie to access /account/*',
    timestamp: new Date().toISOString(),
    via: '/api/auth/login',
  })
}

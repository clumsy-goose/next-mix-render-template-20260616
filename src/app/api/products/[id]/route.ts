import { NextRequest, NextResponse } from 'next/server'

// 动态产品端点
// 用于验证:
//   1. redirect: /old-products/:id -> /api/products/:id (307)
//   2. beforeFiles rewrite: /api/v1/products/:id -> /api/products/:id
//
// Next.js 15 中 params 为 Promise，需要 await
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 简单校验：id 必须为数字，避免无效输入
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: 'Invalid product id, expected a numeric value' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    product: {
      id,
      name: `Product #${id}`,
      price: Number(id) * 9.9,
      inStock: true,
    },
    timestamp: new Date().toISOString(),
    via: '/api/products/[id]',
  })
}

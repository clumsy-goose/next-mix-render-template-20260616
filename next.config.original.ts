import type { NextConfig } from "next";

/**
 * 受信任的外部代理目标白名单。
 * 安全说明（SSRF 防护）：fallback rewrite 仅允许代理到这里写死的可信公网域名，
 * 目标 host 不接受任何用户输入控制，因此不会被诱导去访问内网 / 元数据服务等地址。
 */
const TRUSTED_PROXY_ORIGIN = "https://jsonplaceholder.typicode.com";

const nextConfig: NextConfig = {
  /* ----------------------------------------------------------------------
   * Redirects（重定向）：返回 3xx，浏览器地址栏 URL 会改变
   * -------------------------------------------------------------------- */
  async redirects() {
    return [
      // 1) 基础永久重定向：/home -> /（308 Permanent）
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },

      // 2) 命名通配重定向：旧产品详情页迁移到 API（307 Temporary）
      //    /old-products/123 -> /api/products/123
      {
        source: "/old-products/:id",
        destination: "/api/products/:id",
        permanent: false,
      },

      // 3) 多段通配重定向：旧 API 前缀整体迁移
      //    /legacy-api/products/123 -> /api/v1/products/123
      {
        source: "/legacy-api/:path*",
        destination: "/api/v1/:path*",
        permanent: true,
      },

      // 4) 基于 query 参数的条件重定向（has）：
      //    /search?legacy=true -> /api/health（仅当带 legacy=true 时触发）
      {
        source: "/search",
        has: [{ type: "query", key: "legacy", value: "true" }],
        destination: "/api/health",
        permanent: false,
      },

      // 5) 基于 cookie 缺失的条件重定向（missing）：
      //    访问 /account/* 且没有 session cookie -> 引导登录
      //    /account/orders -> /api/auth/login
      {
        source: "/account/:path*",
        missing: [{ type: "cookie", key: "session" }],
        destination: "/api/auth/login",
        permanent: false,
      },

      // 6) 基于 Host 头的重定向：把 www 域名收敛到主域（裸域）
      //    访问 www.example.com/* -> example.com/*
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.example.com" }],
        destination: "https://example.com/:path*",
        permanent: true,
      },
    ];
  },

  /* ----------------------------------------------------------------------
   * Rewrites（重写）：URL 不变，内部转发到另一个路径 / 目标
   * 返回对象形式可精确控制三个执行阶段：
   *   beforeFiles  -> 在检查文件系统/静态资源之前（可覆盖）
   *   afterFiles   -> 在文件系统之后、动态路由之前
   *   fallback     -> 所有页面/路由都未命中时（适合反向代理）
   * -------------------------------------------------------------------- */
  async rewrites() {
    return {
      beforeFiles: [
        // A) API 版本前缀剥离：/api/v1/* -> /api/*
        //    /api/v1/health   -> /api/health
        //    /api/v1/products/9 -> /api/products/9
        {
          source: "/api/v1/:path*",
          destination: "/api/:path*",
        },

        // B) 灰度发布（条件重写）：满足任一条件即走 beta 端点，URL 仍为 /api/greeting
        //    条件1：请求头 x-canary: always
        {
          source: "/api/greeting",
          has: [{ type: "header", key: "x-canary", value: "always" }],
          destination: "/api/beta/greeting",
        },
        //    条件2：Cookie canary=true
        {
          source: "/api/greeting",
          has: [{ type: "cookie", key: "canary", value: "true" }],
          destination: "/api/beta/greeting",
        },
      ],

      afterFiles: [
        // C) 友好别名重写：对外暴露简短路径，内部指向真实 API
        //    /healthz -> /api/health
        {
          source: "/healthz",
          destination: "/api/health",
        },
        //    /status -> /api/v2/status
        {
          source: "/status",
          destination: "/api/v2/status",
        },
      ],

      fallback: [
        // D) 反向代理（仅当本地无任何匹配时）：转发到受信任的外部 API
        //    /proxy/posts/1 -> https://jsonplaceholder.typicode.com/posts/1
        //    注意：目标 origin 为写死的白名单，:id 仅作为路径段，防止 SSRF
        {
          source: "/proxy/posts/:id",
          destination: `${TRUSTED_PROXY_ORIGIN}/posts/:id`,
        },
      ],
    };
  },
};

export default nextConfig;

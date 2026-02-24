// // @ts-check
// import nextI18NextConfig from "./next-i18next.config.js";
// import dotenv from "dotenv";
// dotenv.config();
//
// /**
//  * Customize the build output type
//  * - `undefined`: The default build output, `.next` directory, that works with production mode `next start` or a hosting provider like Vercel
//  * - `'standalone'`: A standalone build output, `.next/standalone` directory, that only includes necessary files/dependencies. Useful for self-hosting in a Docker container.
//  * - `'export'`: An exported build output, `out` directory, that only includes static HTML/CSS/JS. Useful for self-hosting without a Node.js server.
//  *
//  * @type {any}
//  */
// const output = process.env.NEXT_OUTPUT;
// const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || 4000;
//
// /**
//  * Next.js configuration
//  *
//  * @see https://nextjs.org/docs/app/api-reference/next-config-js
//  *
//  * @param {string} phase
//  * @param {{
//  *  defaultConfig: import('next').NextConfig
//  * }} options
//  * @returns {Promise<import('next').NextConfig>}
//  */
// const nextConfig = async (phase, { defaultConfig }) => {
//   return {
//     i18n: nextI18NextConfig.i18n,
//     trailingSlash: false,
//     reactStrictMode: true,
//     poweredByHeader: false,
//     async rewrites() {
//       return [
//         {
//           source: "/api/:path*",
//           destination: `http://localhost:${backendPort}/api/:path*`, // Proxy to Backend
//         },
//         {
//           source: "/uploads/:path*",
//           destination: `http://localhost:${backendPort}/uploads/:path*`, // Proxy to Backend
//         },
//         {
//           source: "/themes/:path*",
//           destination: `http://localhost:${backendPort}/themes/:path*`, // Proxy to Backend
//         },
//       ];
//     },
//     output,
//     webpack: (config, { isServer, dev }) => {
//       config.externals.push("pino-pretty", "lokijs", "encoding");
//
//       if (dev && !isServer) {
//         config.watchOptions = {
//           ignored: /node_modules/,
//           aggregateTimeout: 300,
//           poll: 1000,
//         };
//       }
//       return config;
//     },
//     images: {
//       /**
//        * When generating static version of your website (export), Next.js can't optimize images for you
//        * so you will need to disable this option.
//        */
//       unoptimized: output === "export",
//
//       remotePatterns: [
//         {
//           protocol: "https",
//           hostname: "cdn.dribbble.com",
//         },
//         {
//           protocol: "https",
//           hostname: "i.pinimg.com",
//         },
//         {
//           protocol: "https",
//           hostname: "miro.medium.com",
//         },
//         {
//           protocol: "https",
//           hostname: "images.pexels.com",
//         },
//         {
//           protocol: "https",
//           hostname: "barcode.tec-it.com",
//         },
//         {
//           protocol: "https",
//           hostname: "flowbite.s3.amazonaws.com",
//         },
//       ],
//     },
//   };
// };
//
// export default nextConfig;

import dotenv from "dotenv";

dotenv.config();

const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || 4000;

// ВАЖЛИВО: i18n прямо тут
const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en").trim();
const locales = (process.env.NEXT_PUBLIC_LANGUAGES || "en")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const config = {
  // 👉 i18n всередині next.config
  i18n: {
    defaultLocale,
    locales,
    // тимчасово вимкнемо авто-редірект за мовою браузера,
    // щоб не застрягати на /uk під час налагодження
    localeDetection: false,
  },

  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${backendPort}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `http://127.0.0.1:${backendPort}/uploads/:path*`,
      },
      {
        source: "/themes/:path*",
        destination: `http://127.0.0.1:${backendPort}/themes/:path*`,
      },

      // Підстраховка: якщо Next раптом не підхопив i18n,
      // прокинемо /uk -> /
      { source: "/:locale(uk|en)", destination: "/" },
      { source: "/:locale(uk|en)/:path*", destination: "/:path*" },
    ];
  },

  webpack: (config, { dev }) => {
    config.externals ||= [];
    config.externals.push("pino-pretty", "lokijs", "encoding");

    if (dev) {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/backend/**",
          "**/models/**",
          "**/seeders/**",
          "**/mysql/**",
          "**/packages/**/server/**",
          "**/*.log",
        ],
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    return config;
  },

  images: {
    unoptimized: process.env.NEXT_OUTPUT === "export",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dribbble.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "miro.medium.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "barcode.tec-it.com" },
      { protocol: "https", hostname: "flowbite.s3.amazonaws.com" },
    ],
  },
};

export default config;

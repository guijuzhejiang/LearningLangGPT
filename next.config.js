/** @type {import('next').NextConfig} */
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  // output: 'export',
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "development"?[]:['aidu.org.cn'],
    },
  },
  env: {
    STT_URL: process.env.STT_URL,
    TTS_URL: process.env.TTS_URL,
    SD_URL: process.env.SD_URL,
    WECHAT_LOGIN_APPID: process.env.WECHAT_LOGIN_APPID,
  },
  basePath:process.env.NODE_ENV === "development"? '/learninglang':'/learninglang',
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'avatars.githubusercontent.com',
  //       port: '',
  //       pathname: '**'
  //     }
  //   ]
  // },
  eslint: {
    ignoreBuildErrors: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ]
  },
  webpack: (config, {isServer}) => {
    config.resolve.extensions.push(".ts", ".tsx")
    config.resolve.fallback = { fs: false }
    config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
              to: `static/chunks/${process.env.NODE_ENV === "development" ? 'app/(chat)/':''}[name][ext]`,
            },
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
              to: `static/chunks/${process.env.NODE_ENV === "development" ? 'app/(chat)/':''}[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
              to: `static/chunks/${process.env.NODE_ENV === "development" ? 'app/(chat)/':''}[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
              to: `static/chunks/${process.env.NODE_ENV === "development" ? 'app/(chat)/':''}[name][ext]`,
            },

            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
              to: `static/chunks/chat/[id]/[name][ext]`,
            },
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
              to: `static/chunks/chat/[id]/[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
              to: `static/chunks/chat/[id]/[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
              to: `static/chunks/chat/[id]/[name][ext]`,
            },

            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
              to: `static/chunks/app/(chat)/chat/[id]/[name][ext]`,
            },
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
              to: `static/chunks/app/(chat)/chat/[id]/[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
              to: `static/chunks/app/(chat)/chat/[id]/[name][ext]`,
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
              to: `static/chunks/app/(chat)/chat/[id]/[name][ext]`,
            },
          ],
        })
    );

    return config
  },

}

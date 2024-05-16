/** @type {import('next').NextConfig} */
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  basePath:'/learninglang',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  eslint: {
    ignoreBuildErrors: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: false,
  webpack: (config, {isServer}) => {
    config.resolve.extensions.push(".ts", ".tsx")
    config.resolve.fallback = { fs: false }
    config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
              to: "static/chunks/app/(chat)/[name][ext]",
            },
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
              to: "static/chunks/app/(chat)/[name][ext]",
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
              to: "static/chunks/app/(chat)/[name][ext]",
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
              to: "static/chunks/app/(chat)/[name][ext]",
            },

            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
              to: "static/chunks/app/(chat)/chat/[id]/[name][ext]",
            },
            {
              from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
              to: "static/chunks/app/(chat)/chat/[id]/[name][ext]",
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
              to: "static/chunks/app/(chat)/chat/[id]/[name][ext]",
            },
            {
              from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
              to: "static/chunks/app/(chat)/chat/[id]/[name][ext]",
            },
          ],
        })
    );

    return config
  },

}

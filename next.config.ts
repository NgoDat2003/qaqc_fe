import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname), // fix: ngăn Turbopack nhầm D:\work làm root
  },
};

export default nextConfig;

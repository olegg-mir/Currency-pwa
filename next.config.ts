import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/", revision: process.env.VERCEL_GIT_COMMIT_SHA ?? "development" },
    { url: "/icon-192.png", revision: "1" },
    { url: "/icon-512.png", revision: "1" },
    { url: "/icon-maskable-512.png", revision: "1" },
    { url: "/apple-touch-icon.png", revision: "1" },
    { url: "/favicon.svg", revision: "1" },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);

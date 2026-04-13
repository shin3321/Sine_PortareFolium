import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    reactCompiler: true,
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "*.supabase.co" },
            { protocol: "https", hostname: "img.youtube.com" },
            { protocol: "https", hostname: "i.ytimg.com" },
        ],
    },
};

export default nextConfig;

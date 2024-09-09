/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader", // Load the Markdown files as raw strings
    });

    return config;
  },
};

export default nextConfig;

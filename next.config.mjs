/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Strict Mode enabled by default
    webpack(config) {
        config.resolve.alias['@fortawesome/fontawesome-svg-core/styles.css'] = '@fortawesome/fontawesome-svg-core';
        return config;
      },
};

export default nextConfig;

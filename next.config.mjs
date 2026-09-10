import fs from 'node:fs';

// Node 26+ on Windows compat fix for Webpack (converts EISDIR back to EINVAL for non-symlinks)
const patchReadlink = (fn) => {
    return function (...args) {
        const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        if (cb) {
            return fn.call(fs, ...args, (err, ...res) => {
                if (err && err.code === 'EISDIR') err.code = 'EINVAL';
                cb(err, ...res);
            });
        }
        try {
            return fn.call(fs, ...args);
        } catch (err) {
            if (err && err.code === 'EISDIR') err.code = 'EINVAL';
            throw err;
        }
    };
};

if (fs.readlinkSync) fs.readlinkSync = patchReadlink(fs.readlinkSync);
if (fs.readlink) fs.readlink = patchReadlink(fs.readlink);
if (fs.promises?.readlink) {
    const origPromiseReadlink = fs.promises.readlink;
    fs.promises.readlink = async function (...args) {
        try {
            return await origPromiseReadlink.call(fs.promises, ...args);
        } catch (err) {
            if (err && err.code === 'EISDIR') err.code = 'EINVAL';
            throw err;
        }
    };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            },
            {
                // Protect API routes with additional headers
                source: '/api/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0'
                    }
                ]
            }
        ];
    },

    // Disable x-powered-by header
    poweredByHeader: false,

    // Enable strict mode
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Fix for pdfjs-dist and client-side Node modules
    webpack: (config, { isServer }) => {
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            };
        }
        return config;
    }
};

export default nextConfig;

/**
 * NEXT.JS CONFIGURATION
 * 
 * Purpose: Configures Next.js framework settings and optimizations
 * Contains: TypeScript route configuration, image optimization settings
 * Requirements: Enables type-safe routing and Google profile image loading
 * Dependencies: Next.js 15.5.3 framework
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Enable typed routes for better TypeScript integration */
  typedRoutes: true,
  /** Configure image optimization domains */
  images: {
    /** Allow Google profile images for OAuth authentication */
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig

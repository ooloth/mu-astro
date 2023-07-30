import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import yaml from '@rollup/plugin-yaml'

// see: https://astro.build/config
export default defineConfig({
  compressHTML: true,
  experimental: {
    assets: true,
  },
  image: {
    service: {
      entrypoint: './src/api/image-service.ts', // 'astro/assets/services/squoosh' | 'astro/assets/services/sharp' | string,
      config: {
        // ... service-specific config. Optional.
      },
    },
  },
  integrations: [
    sitemap(),
    tailwind({
      // Disable injecting a basic `base.css` import on every page so I can define and import my own
      applyBaseStyles: false,
    }),
  ],
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
  vite: {
    plugins: [yaml()],
  },
})

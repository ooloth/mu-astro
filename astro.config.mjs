import { defineConfig } from 'astro/config'
import rehypeCloudinaryImageAttributes from './lib/rehype/cloudinary-image-attributes.ts'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import yaml from '@rollup/plugin-yaml'

// see: https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [
    sitemap(),
    tailwind({
      // Disable injecting a basic `base.css` import on every page so I can define and import my own
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeCloudinaryImageAttributes],
  },
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
  vite: {
    plugins: [yaml()],
  },
})

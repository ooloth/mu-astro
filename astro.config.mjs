import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

// see: https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [tailwind(), sitemap()],
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
})

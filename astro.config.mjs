import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// see: https://astro.build/config
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [tailwind(), sitemap()],
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
})

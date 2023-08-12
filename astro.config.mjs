import { defineConfig } from 'astro/config'
import remarkUnwrapImages from 'remark-unwrap-images'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'

import rehypeCloudinaryImageAttributes from './lib/rehype/cloudinary-image-attributes.ts'
import cacheResourcesByAssetFolder from './lib/cloudinary/cacheResourcesByAssetFolder.ts'

// Save all Cloudinary image details with a single Admin API call each time the build begins
await cacheResourcesByAssetFolder()

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
    remarkPlugins: [remarkUnwrapImages],
    rehypePlugins: [rehypeCloudinaryImageAttributes],
  },
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
})

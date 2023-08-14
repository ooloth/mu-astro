import { defineConfig } from 'astro/config'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkUnwrapImages from 'remark-unwrap-images'
import tailwind from '@astrojs/tailwind'

import rehypeCloudinaryImageAttributes from './lib/rehype/cloudinary-image-attributes.ts'

// see: https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [
    tailwind({
      // Disable injecting a basic `base.css` import on every page so I can define and import my own
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkUnwrapImages],
    rehypePlugins: [rehypeCloudinaryImageAttributes, [rehypePrettyCode, {}]],
    syntaxHighlight: false, // use rehype-pretty-code instead of shiki/prism built-ins
  },
  scopedStyleStrategy: 'class',
  site: 'https://michaeluloth.com',
  trailingSlash: 'always',
  vite: {
    // solves "Error: No loader is configured for ".node" files: node_modules/fsevents/fsevents.node"
    // see: https://stackoverflow.com/a/75655669/8802485
    optimizeDeps: { exclude: ['fsevents'] },
  },
})

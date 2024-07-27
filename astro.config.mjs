import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import rehypePlugins from './lib/rehype/plugins.ts'
import remarkPlugins from './lib/remark/plugins.ts'

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
    // NOTE: mirror any updates I make here in pages/rss.xml.ts
    // TODO: define a single source of truth for these settings this file + rss can import?
    remarkPlugins,
    rehypePlugins,
    syntaxHighlight: false, // use rehype-pretty-code instead of built-in shiki/prism
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

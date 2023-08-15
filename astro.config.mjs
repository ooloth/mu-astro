import { defineConfig } from 'astro/config'
import fsExtra from 'fs-extra'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkUnwrapImages from 'remark-unwrap-images'
import tailwind from '@astrojs/tailwind'

import rehypeCloudinaryImageAttributes from './lib/rehype/cloudinary-image-attributes.ts'

// source: https://github.com/atomiks/rehype-pretty-code/blob/master/website/assets/moonlight-ii.json
const moonlightV2 = await fsExtra.readJson('./lib/rehype/themes/moonlight-ii.json')

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
    rehypePlugins: [
      rehypeCloudinaryImageAttributes,
      // see: https://rehype-pretty-code.netlify.app
      [rehypePrettyCode, { keepBackground: false, theme: moonlightV2 }],
    ],
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

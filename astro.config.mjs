import fsExtra from 'fs-extra'

import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import rehypePrettyCode from 'rehype-pretty-code'
import { transformerCopyButton } from '@rehype-pretty/transformers'

import rehypePlugins from './lib/rehype/plugins.ts'
import remarkPlugins from './lib/remark/plugins.ts'

// source: https://github.com/atomiks/rehype-pretty-code/blob/master/website/assets/moonlight-ii.json
const moonlightV2 = await fsExtra.readJson('./lib/rehype/themes/moonlight-ii.json')

// see: https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Disable injecting a basic `base.css` import on every page so I can define and import my own
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins,
    rehypePlugins: [
      ...rehypePlugins,
      [
        // Include this when building for the site, but not for the RSS feed (which leads to errors)
        rehypePrettyCode,
        {
          // see: https://rehype-pretty.pages.dev/#options
          keepBackground: false,
          theme: moonlightV2,
          tokensMap: {
            fn: 'entity.name.function',
            kw: 'keyword',
            key: 'meta.object-literal.key',
            pm: 'variable.parameter',
            obj: 'variable.other.object',
            str: 'string',
          },
          transformers: [
            transformerCopyButton({
              visibility: 'hover',
            }),
          ],
        },
      ],
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

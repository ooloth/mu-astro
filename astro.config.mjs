import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// see: https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
})

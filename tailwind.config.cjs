/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      boxShadow: {
        /* solid shadow, glow shadow */
        glow: '0 0 0 0.15em var(--moonlight-red), 0 0 1.5em 0 var(--moonlight-red)',
      },
      willChange: {
        opacity: 'opacity',
      },
    },
  },
}

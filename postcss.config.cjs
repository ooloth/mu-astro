// See: https://tailwindcss.com/docs/using-with-preprocessors#using-post-css-as-your-preprocessor

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
    },
    autoprefixer: {},
  },
}

import fsExtra from 'fs-extra'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeUnwrapImages from 'rehype-unwrap-images'

import rehypeCloudinaryImageAttributes from './cloudinary-image-attributes'

// source: https://github.com/atomiks/rehype-pretty-code/blob/master/website/assets/moonlight-ii.json
const moonlightV2 = await fsExtra.readJson('./lib/rehype/themes/moonlight-ii.json')

export default [
  rehypeCloudinaryImageAttributes,
  [
    rehypePrettyCode,
    {
      // see: https://rehype-pretty-code.netlify.app
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
    },
  ],
  rehypeUnwrapImages,
]

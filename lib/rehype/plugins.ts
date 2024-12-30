import rehypeUnwrapImages from 'rehype-unwrap-images'

import rehypeCloudinaryImageAttributes from './cloudinary-image-attributes'
import { type RehypePlugins } from 'astro'

export default [rehypeCloudinaryImageAttributes, rehypeUnwrapImages] satisfies RehypePlugins

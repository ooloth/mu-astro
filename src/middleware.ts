// See: https://docs.astro.build/en/guides/middleware/

import type { APIContext, MiddlewareNext } from 'astro'
import { defineMiddleware } from 'astro:middleware'

/**
 * Workaround for static file endpoints requiring a trailing slash in DEV when "trailingSlash" is "always".
 * Defining these "redirects" in astro.config.mjs does not work.
 *
 * See: https://github.com/withastro/astro/issues/10149
 * See: https://github.com/withastro/astro/issues/9674
 * See: https://docs.astro.build/en/reference/configuration-reference/#redirects
 * See: https://github.com/withastro/astro/issues/12532
 * See: https://docs.astro.build/en/guides/middleware/#rewriting
 */
export const redirectStaticEndpointsInDevelopment = defineMiddleware(
  (context: APIContext, next: MiddlewareNext): Promise<Response> => {
    if (import.meta.env.PROD) {
      return next()
    }

    const shouldRedirect = ['.xml', '.json'].some(ext => context.url.href.endsWith(ext))

    if (!shouldRedirect) {
      return next()
    }

    // Show the user the route with a trailing slash (to avoid the 404 that occurs in dev only when a slash is missing)
    return context.rewrite(new Request(`${context.url.href}/`))
  },
)

export const onRequest = redirectStaticEndpointsInDevelopment

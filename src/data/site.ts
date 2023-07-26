export default {
  author: {
    name: 'Michael Uloth',
    email: 'michaeluloth@gmail.com',
    url: 'https://michaeluloth.com/about/',
  },
  color: {
    background: '#ffffff',
    theme: '#ffffff',
  },
  description: {
    site: 'Software engineer helping scientists discover new medicines at Recursion.',
    rss: 'Blog posts by Michael Uloth',
  },
  language: 'en',
  manifest: {
    display: 'standalone',
    shortName: 'MU',
    startUrl: '.',
  },
  openGraph: {
    image: 'mu/michael-landscape.jpg',
    locale: 'en_CA',
    twitter: {
      card: 'summary_large_image',
      creator: '@ooloth',
      site: '@ooloth',
    },
    type: 'website',
  },
  title: 'Michael Uloth',
  url: 'https://michaeluloth.com/',
} as const

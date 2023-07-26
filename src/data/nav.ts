export type NavItem = {
  title: string
  url: string
}

export default {
  top: [
    { title: 'writing', url: '/' },
    { title: 'notes', url: '/notes/' },
    { title: 'about', url: '/about/' },
    // { title: 'likes', url: '/likes/' },
  ],
  bottom: [
    { title: 'RSS', url: '/rss.xml' },
    { title: 'YouTube', url: 'https://www.youtube.com/user/michaeluloth' },
    { title: 'Twitter', url: 'https://twitter.com/ooloth' },
    { title: 'GitHub', url: 'https://github.com/ooloth' },
  ],
} satisfies { top: NavItem[]; bottom: NavItem[] }

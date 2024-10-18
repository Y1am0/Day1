import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DayOne Habit Tracker',
    short_name: 'DayOne',
    description: 'Your guide to a more focused life',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/mobile/icon192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/mobile/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
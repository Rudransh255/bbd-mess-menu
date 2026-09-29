import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BBD Mess',
    short_name: 'BBD Mess',
    description: 'See today’s hostel mess meals, timings and weekly menu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f4f1',
    theme_color: '#ffe600',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

import type { Config } from '@react-router/dev/config';

export default {
  // Disable SSR for static deployment to Netlify
  ssr: false,
  // Disable prerender to avoid Clerk validation issues during build
  // prerender: ['/'],
} satisfies Config;

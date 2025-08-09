import { rootAuthLoader } from '@clerk/react-router/ssr.server';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { SettingsPage } from '@/components/features/Settings';
import SecureErrorBoundary from '@/components/shared/SecureErrorBoundary';
import { storeIntendedDestination } from '@/utils/auth/redirects';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings - MarkDown Ultra Editor' },
    {
      name: 'description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { property: 'og:title', content: 'Settings - MarkDown Ultra Editor' },
    {
      property: 'og:description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Settings - MarkDown Ultra Editor' },
    {
      name: 'twitter:description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Load authentication state
  const authData = await rootAuthLoader(args);

  // Check if user is authenticated
  // Type assertion is safe here as rootAuthLoader returns auth state
  const authState = authData as { userId?: string | null };

  if (!authState.userId) {
    // Store intended destination for post-auth redirect
    if (typeof window !== 'undefined') {
      storeIntendedDestination('/settings');
    }

    // Redirect to sign-in page
    throw redirect('/sign-in');
  }

  return authData;
}

/**
 * Main settings route component
 */
export default function SettingsRoute() {
  return (
    <SecureErrorBoundary>
      <SettingsPage />
    </SecureErrorBoundary>
  );
}

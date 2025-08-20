import { useAuth } from '@clerk/react-router';
import { rootAuthLoader } from '@clerk/react-router/ssr.server';
import { useEffect } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useNavigate } from 'react-router';
import { SettingsPage } from '@/components/features/Settings';
import SecureErrorBoundary from '@/components/shared/SecureErrorBoundary';

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
  return rootAuthLoader(args);
}

/**
 * Protected wrapper component for settings
 */
function ProtectedSettingsWrapper() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // For Guest Mode, redirect directly to home instead of sign-in
      navigate('/', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render settings if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  return <SettingsPage />;
}

/**
 * Main settings route component
 */
export default function SettingsRoute() {
  return (
    <SecureErrorBoundary>
      <ProtectedSettingsWrapper />
    </SecureErrorBoundary>
  );
}

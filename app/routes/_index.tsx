import { QueryClientProvider } from '@tanstack/react-query';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import SecureErrorBoundary from '@/components/shared/SecureErrorBoundary';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { queryClient } from '@/lib/queryClient';
import { ErrorCategory } from '@/utils/sentry';

export const meta: MetaFunction = () => {
  return [
    { title: 'MarkDown Ultra Editor' },
    {
      name: 'description',
      content:
        'Editor markdown modern dengan fitur live preview, syntax highlighting, dan berbagai tema yang dapat disesuaikan',
    },
    { name: 'author', content: 'MarkDown Ultra' },
    {
      name: 'keywords',
      content: 'markdown, editor, live preview, syntax highlighting, react, typescript',
    },
    { property: 'og:title', content: 'MarkDown Ultra Editor' },
    {
      property: 'og:description',
      content:
        'Editor markdown modern dengan fitur live preview, syntax highlighting, dan berbagai tema yang dapat disesuaikan',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/placeholder.svg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MarkDown Ultra Editor' },
    {
      name: 'twitter:description',
      content:
        'Editor markdown modern dengan fitur live preview, syntax highlighting, dan berbagai tema yang dapat disesuaikan',
    },
    { name: 'twitter:image', content: '/placeholder.svg' },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  // Simple loader without security middleware
  return {};
}

export default function Index() {
  return (
    <SecureErrorBoundary category={ErrorCategory.USER_ACTION}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <MarkdownEditor />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </SecureErrorBoundary>
  );
}

/**
 * @fileoverview Files management page
 * @author Axel Modra
 */

import { getAuth } from '@clerk/react-router/ssr.server';
import { QueryClientProvider } from '@tanstack/react-query';
import type { MetaFunction } from 'react-router';
import { type LoaderFunctionArgs, redirect } from 'react-router';
import { FilesManager } from '@/components/files/FilesManager';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';

export const meta: MetaFunction = () => {
  return [
    { title: 'My Files - MarkDown Ultra Editor' },
    {
      name: 'description',
      content: 'Manage your markdown files with cloud storage and local backup options',
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { property: 'og:title', content: 'My Files - MarkDown Ultra Editor' },
    {
      property: 'og:description',
      content: 'Manage your markdown files with cloud storage and local backup options',
    },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'My Files - MarkDown Ultra Editor' },
    {
      name: 'twitter:description',
      content: 'Manage your markdown files with cloud storage and local backup options',
    },
  ];
};

// Using global optimized QueryClient from lib/queryClient.ts

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect('/sign-in');
  }

  return { userId };
}

export default function FilesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen w-full bg-background">
          <FilesManager />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/**
 * @fileoverview Files management page
 * @author Axel Modra
 */

import type { MetaFunction } from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilesManager } from "@/components/files/FilesManager";
import { LoaderFunctionArgs, redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";

export const meta: MetaFunction = () => {
  return [
    { title: "My Files - MarkDown Ultra Editor" },
    {
      name: "description",
      content: "Manage your markdown files with cloud storage and local backup options"
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { property: "og:title", content: "My Files - MarkDown Ultra Editor" },
    { property: "og:description", content: "Manage your markdown files with cloud storage and local backup options" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "My Files - MarkDown Ultra Editor" },
    { name: "twitter:description", content: "Manage your markdown files with cloud storage and local backup options" },
  ];
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  }
});

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
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

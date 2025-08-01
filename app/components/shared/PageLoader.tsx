/**
 * @fileoverview Reusable full-page loader component
 * @author Axel Modra
 */

import { Loader2 } from "lucide-react";
import type React from "react";

interface PageLoaderProps {
  text?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  text = "Loading...",
}) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  </div>
);

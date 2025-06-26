/**
 * @fileoverview Main components exports - Centralized component management
 * @author Axel Modra
 */

// Layout components
export * from './layout';

// Editor components
export * from './editor';

// Feature components
export * from './features';

// Navigation components
export * from './navigation';

// Template components
export * from './templates';

// Shared components
export * from './shared';

// UI components (selective exports to avoid conflicts)
export { Button } from './ui/button';
export { Input } from './ui/input';
export { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
export { Toaster } from './ui/toaster';
export { useToast as useUIToast } from './ui/use-toast';

/**
 * This file is the entry point for the client-side of the application.
 * It is responsible for hydrating the app and rendering the root component.
 * It is also responsible for initializing the production safety checks and the Sentry error tracking.
 */

import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { initializeProductionSafety } from '@/utils/production/safety';
import { secureSentry } from '@/utils/sentry';

initializeProductionSafety();

secureSentry.initialize();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});

/**
 * @fileoverview Type definitions for root route
 * @author Axel Modra
 */

import type { LoaderFunctionArgs } from 'react-router';

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export interface ComponentProps {
    loaderData?: any;
  }
}

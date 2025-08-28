import type { LoaderFunctionArgs } from 'react-router';

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export interface ComponentProps {
    loaderData?: unknown;
  }
}

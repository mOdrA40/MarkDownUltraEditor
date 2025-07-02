/// <reference types="vite/client" />

declare namespace NodeJS {
    interface ProcessEnv {
        VITE_CLERK_PUBLISHABLE_KEY: string;
        CLERK_SECRET_KEY: string;
        VITE_SUPABASE_URL: string;
        VITE_SUPABASE_ANON_KEY: string;
        NODE_ENV: 'development' | 'production' | 'test';
    }
}

interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __VITE_CLERK_PUBLISHABLE_KEY__: string; 
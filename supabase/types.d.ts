declare namespace Deno {
  interface EnvGet {
    (key: string): string | undefined;
  }
  interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
    onError?: (error: unknown) => Response | Promise<Response>;
  }
  function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: ServeOptions,
  ): void;
  const env: {
    get: EnvGet;
  };
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
}

declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
  function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}
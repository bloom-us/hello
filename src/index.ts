import debug, { type Debugger } from "debug";

// Type to generate patterns for one environment across all namespaces
type JoinNamespacesWithEnv<
  N extends readonly string[],
  E extends string
> = N extends readonly [infer NFirst, ...infer NRest]
  ? NRest extends readonly string[]
    ? NFirst extends string
      ? NRest["length"] extends 0
        ? `${NFirst}:${E}`
        : `${NFirst}:${E},${JoinNamespacesWithEnv<NRest, E>}`
      : never
    : never
  : "";

// Type to combine all environments
type JoinAllEnvironments<
  N extends readonly string[],
  E extends readonly string[]
> = E extends readonly [infer EFirst, ...infer ERest]
  ? ERest extends readonly string[]
    ? EFirst extends string
      ? ERest["length"] extends 0
        ? JoinNamespacesWithEnv<N, EFirst>
        : `${JoinNamespacesWithEnv<N, EFirst>},${JoinAllEnvironments<N, ERest>}`
      : never
    : never
  : "";

type DebugMap<E extends readonly string[]> = { [K in E[number]]: Debugger };

// Type for multi-namespace logger
export type Hello<N extends readonly string[], E extends readonly string[]> = {
  [K in N[number]]: DebugMap<E>;
};

// Helper to create multiple patterns with preserved literal types
export function createDebugPatterns<
  N extends readonly string[],
  E extends readonly string[]
>(namespaces: N, environments: E): JoinAllEnvironments<N, E> {
  return environments
    .flatMap((env) => namespaces.map((namespace) => `${namespace}:${env}`))
    .join(",") as JoinAllEnvironments<N, E>;
}

export const helloInnit = <
  N extends readonly string[],
  E extends readonly string[]
>(
  namespaces: N,
  environments: E
): Hello<N, E> => {
  // Create a cache to store instantiated debuggers
  const debuggerCache = new Map<string, Debugger>();

  // Function to create or retrieve cached debug instance
  const getDebugger = (namespace: string, env: string): Debugger => {
    const key = `${namespace}:${env}`;
    if (!debuggerCache.has(key)) {
      debuggerCache.set(key, debug(key));
    }
    return debuggerCache.get(key)!;
  };

  // Create proxy structures for lazy initialization
  const hello = {} as Hello<N, E>;

  // Build the namespace level
  for (const namespace of namespaces) {
    const envMap = {} as DebugMap<E>;

    // Build the environment level with proxies
    for (const env of environments) {
      // Define getters/setters for common properties that should be forwarded
      const propertyHandlers: PropertyDescriptorMap = {
        enabled: {
          get() {
            return getDebugger(namespace, env).enabled;
          },
          set(value: boolean) {
            getDebugger(namespace, env).enabled = value;
          },
          configurable: true,
        },
        namespace: {
          get() {
            return getDebugger(namespace, env).namespace;
          },
          configurable: true,
        },
      };

      // Create a proxy function that forwards calls to the actual debug instance
      const debugProxy = new Proxy(
        function (this: unknown, ...args: Parameters<Debugger>) {
          return getDebugger(namespace, env)(...args);
        },
        {
          get(target, prop: string | symbol) {
            if (prop === "then") {
              // Special case to prevent proxy from being treated as a Promise
              return undefined;
            }
            return getDebugger(namespace, env)[prop as keyof Debugger];
          },
          set(target, prop: string | symbol, value: unknown) {
            (getDebugger(namespace, env) as any)[prop] = value;
            return true;
          },
        }
      ) as unknown as Debugger;

      Object.defineProperties(debugProxy, propertyHandlers);
      envMap[env as E[number]] = debugProxy;
    }

    hello[namespace as N[number]] = envMap;
  }

  return hello;
};

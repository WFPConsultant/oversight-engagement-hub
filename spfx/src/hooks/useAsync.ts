import * as React from 'react';

export interface IAsyncState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  reload: () => void;
}

/** Runs `load` on mount and whenever `deps` change; ignores results that arrive after unmount. */
export function useAsync<T>(load: () => Promise<T>, deps: React.DependencyList): IAsyncState<T> {
  const [state, setState] = React.useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    load().then(
      (data) => { if (!cancelled) setState({ data, loading: false }); },
      (error) => { if (!cancelled) setState({ error: error instanceof Error ? error : new Error(String(error)), loading: false }); }
    );
    return () => { cancelled = true; };

  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}

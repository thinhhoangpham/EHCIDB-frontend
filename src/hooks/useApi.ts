"use client";

import { useState, useCallback, useRef } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T, A extends unknown[]>(apiFn: (...args: A) => Promise<T>) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const latestRef = useRef(0);

  const execute = useCallback(
    async (...args: A): Promise<T | undefined> => {
      const requestId = ++latestRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiFn(...args);
        if (requestId === latestRef.current) {
          setState({ data, loading: false, error: null });
        }
        return data;
      } catch (err: unknown) {
        if (requestId === latestRef.current) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setState((prev) => ({ ...prev, loading: false, error: message }));
        }
      }
    },
    [apiFn]
  );

  return { ...state, execute };
}

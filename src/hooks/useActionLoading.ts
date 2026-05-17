"use client";

import { useCallback, useRef, useState } from "react";

type ActionResult<T> = T | Promise<T>;
type ActionHandler<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => ActionResult<TResult>;

export function useActionLoading<TArgs extends unknown[], TResult>(
  action: ActionHandler<TArgs, TResult>
) {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      if (loadingRef.current) return undefined;

      loadingRef.current = true;
      setLoading(true);

      try {
        return await action(...args);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [action]
  );

  return { loading, run };
}

import { useCallback, useEffect, useRef } from "react";

type DebounceTimer = ReturnType<typeof setTimeout> | null;

export const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay = 200
) => {
  const timerRef = useRef<DebounceTimer>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

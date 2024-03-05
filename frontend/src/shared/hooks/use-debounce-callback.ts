import * as React from 'react';
import debounce from 'lodash/debounce';

type DebouncedFunc<T extends (...args: never[]) => unknown> = {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
};

export function useDebouncedCallback<C extends (...params: never[]) => unknown>(
  fn: C,
  delay: number,
  dependencies: React.DependencyList,
): DebouncedFunc<C> {
  const debouncedFn = debounce(fn, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(debouncedFn, dependencies);
}

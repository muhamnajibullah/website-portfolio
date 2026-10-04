import { useEffect } from 'react';

const owners = new Set<symbol>();
let previousBodyOverflow = '';
let previousRootOverflow = '';

export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const owner = Symbol('scroll-lock');
    // Dialog/world handoffs and nested dialogs must share the original page state.
    if (owners.size === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousRootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    owners.add(owner);
    return () => {
      owners.delete(owner);
      if (owners.size === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousRootOverflow;
      }
    };
  }, [enabled]);
}

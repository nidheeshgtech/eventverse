import { useEffect, useRef } from 'react';

/** Calls `onHidden` whenever the tab is backgrounded or the window loses focus. */
export function useDocumentHidden(onHidden: () => void, enabled = true): void {
  const cb = useRef(onHidden);
  cb.current = onHidden;

  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => document.hidden && cb.current();
    const onBlur = () => cb.current();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onBlur);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onBlur);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled]);
}

// src/hooks.ts
import { useEffect, useState } from 'react';
import { useMagic } from './provider';

export function useIsLoggedIn(pollInterval = 5000) {
  const { magic } = useMagic();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    let t: number | undefined;

    if (!magic) {
      setIsLoggedIn(false);
      return;
    }

    const check = async () => {
      try {
        const r = await magic.user.isLoggedIn();
        if (!mounted) return;
        setIsLoggedIn(r);
      } catch {
        if (!mounted) return;
        setIsLoggedIn(false);
      } finally {
        t = window.setTimeout(check, pollInterval);
      }
    };

    check();

    return () => {
      mounted = false;
      if (t) clearTimeout(t);
    };
  }, [magic, pollInterval]);

  return isLoggedIn;
}

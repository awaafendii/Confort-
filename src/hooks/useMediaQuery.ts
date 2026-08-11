import { useEffect, useState } from 'react';

/** Hook responsive — base des layouts adaptatifs mobile/tablette/desktop. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const listener = () => setMatches(mql.matches);
    listener();
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** Points de rupture Confort+ — alignés avec Tailwind (sm/md/lg). */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

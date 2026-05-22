import { useEffect, useState } from 'react';

// Returns false during SSR and the first synchronous client render,
// true after the first useEffect tick. Use to gate any rendering that
// depends on URL params, AsyncStorage-persisted state, Date, or
// Math.random() — all of which differ between server and client and
// would otherwise cause React 19 to abort hydration on mismatch.
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

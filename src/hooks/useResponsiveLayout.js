import { useEffect, useState } from 'react';

export const MOBILE_MAX_PX = 768;

const RESPONSIVE_LAYOUT_QUERY = `(max-width: ${MOBILE_MAX_PX}px)`;
const STATIC_LAYOUTS = new Set(['reference', 'mobile', 'desktop']);

const resolveStaticLayout = layout => (STATIC_LAYOUTS.has(layout) ? layout : 'reference');

const resolveInitialLayout = layout => (layout === 'auto' ? 'reference' : resolveStaticLayout(layout));

export const useResponsiveLayout = layout => {
  const [resolvedLayout, setResolvedLayout] = useState(() => resolveInitialLayout(layout));

  useEffect(() => {
    if (layout !== 'auto') {
      setResolvedLayout(resolveStaticLayout(layout));
      return undefined;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setResolvedLayout('reference');
      return undefined;
    }

    const mediaQuery = window.matchMedia(RESPONSIVE_LAYOUT_QUERY);
    const resolveMatch = event => setResolvedLayout(event.matches ? 'mobile' : 'reference');

    resolveMatch(mediaQuery);
    mediaQuery.addEventListener?.('change', resolveMatch);

    return () => {
      mediaQuery.removeEventListener?.('change', resolveMatch);
    };
  }, [layout]);

  return resolvedLayout;
};

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that the window scrolls back to the top
 * whenever the user navigates to a new route.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll to top instantly on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

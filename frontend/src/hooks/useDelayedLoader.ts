import { useState, useEffect } from 'react';

export const useDelayedLoader = (isLoading: boolean, delay: number = 250) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    if (isLoading) {
      // Start the delay timer when loading begins
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      // Hide loader immediately when loading stops
      setShowLoader(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  return showLoader;
};

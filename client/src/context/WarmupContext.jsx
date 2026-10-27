import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WarmupContext = createContext({ isWarmingUp: false });

export const useWarmup = () => useContext(WarmupContext);

// Keep a singleton promise so the warm-up runs exactly once across component mounts
let warmupPromise = null;

export const startSilentWarmup = () => {
  if (!warmupPromise) {
    const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
    const apiBase = rawApiUrl.endsWith('/api')
      ? rawApiUrl
      : (rawApiUrl ? `${rawApiUrl.replace(/\/+$/, '')}/api` : '/api');
    const healthUrl = `${apiBase.replace(/\/+$/, '')}/health`;

    // Send single silent GET request to /api/health with a 60s timeout and ignore the result
    warmupPromise = axios
      .get(healthUrl, { timeout: 60000 })
      .catch(() => {
        // Silently ignore warmup errors or timeouts
      })
      .then(() => {});
  }
  return warmupPromise;
};

export const WarmupProvider = ({ children }) => {
  const [isWarmingUp, setIsWarmingUp] = useState(true);

  useEffect(() => {
    let isMounted = true;

    startSilentWarmup().finally(() => {
      if (isMounted) {
        setIsWarmingUp(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WarmupContext.Provider value={{ isWarmingUp }}>
      {children}
    </WarmupContext.Provider>
  );
};

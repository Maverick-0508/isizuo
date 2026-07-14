import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '@/stores';
import i18n from '@/i18n';

export function useTranslation() {
  const { language } = useAppStore();

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const t = useCallback((key: string, options?: any) => {
    return i18n.t(key, options);
  }, [language]);

  return { t, locale: language };
}

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setIsLoading(false);
    })();
  }, []);

  return { location, errorMsg, isLoading };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

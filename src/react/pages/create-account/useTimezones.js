import { useState, useEffect } from 'react';
import { useStore } from '@store';

/**
 * Loads enabled timezones from the shared store (same source as Profile).
 * @returns {{ timezoneId, setTimezoneId, timezoneItems, timezonesLoading }}
 */
export function useTimezones() {
  const timezonesStore = useStore('timezones');
  const timezonesActions = timezonesStore?.actions || {};
  const [timezoneId, setTimezoneId] = useState('');
  const [timezoneItems, setTimezoneItems] = useState([]);
  const [timezonesLoading, setTimezonesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadTimezones = async () => {
      if (!timezonesActions?.getItems) {
        return;
      }
      setTimezonesLoading(true);
      try {
        const response = await timezonesActions.getItems({ enabled: true });
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : Array.isArray(response?.member)
              ? response.member
              : [];
        if (!cancelled) {
          setTimezoneItems(items);
        }
      } catch (e) {
        if (!cancelled) {
          setTimezoneItems([]);
        }
      } finally {
        if (!cancelled) {
          setTimezonesLoading(false);
        }
      }
    };
    loadTimezones();
    return () => {
      cancelled = true;
    };
  }, [timezonesActions]);

  return { timezoneId, setTimezoneId, timezoneItems, timezonesLoading };
}

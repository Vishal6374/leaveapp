import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

interface UseSessionTimeoutProps {
  timeoutMs?: number; // Inactivity timeout in ms (default: 15 mins)
  onTimeout: () => void;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutMs = 15 * 60 * 1000,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (enabled) {
      timerRef.current = setTimeout(() => {
        Alert.alert(
          'Session Expired',
          'You were logged out due to 15 minutes of inactivity for security reasons.',
          [{ text: 'OK', onPress: onTimeout }]
        );
      }, timeoutMs);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, timeoutMs]);

  return { resetTimer };
};

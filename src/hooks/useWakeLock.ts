import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);

      wakeLockSentinelRef.current.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockSentinelRef.current = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock 請求失敗或被系統拒絕：', err);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch (err) {
        console.warn('Wake Lock 釋放失敗：', err);
      } finally {
        wakeLockSentinelRef.current = null;
        setIsLocked(false);
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      requestLock();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && enabled) {
          requestLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseLock();
      };
    } else {
      releaseLock();
    }
  }, [enabled, requestLock, releaseLock]);

  return { isLocked, requestLock, releaseLock };
}

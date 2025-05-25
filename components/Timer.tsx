import { useState, useRef, useEffect } from 'react';
import { YStack, SizableText } from 'tamagui';
import { Button } from './Button';
import { createSession, endSession } from '~/utils/supabase';

export function Timer({ userId }: { userId: string | null }) {
  const [elapsedTime, setElapsedTime] = useState(0); // total time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [lastStartTime, setLastStartTime] = useState<number | null>(null); // ms timestamp
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);

  // Start or resume timer
  const start = async () => {
    if (!isRunning && userId) {
      // Create session if needed
      if (!sessionId) {
        const now = new Date().toISOString();
        try {
          const session = await createSession(userId, now);
          setSessionId(session.id);
        } catch (e) {}
      }
      // Clear pause timeout if resuming
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      // Set lastStartTime to now
      setLastStartTime(Date.now());
      setIsRunning(true);
    }
  };

  // Pause timer
  const pause = () => {
    if (isRunning && lastStartTime) {
      // Add the time since last start to elapsedTime
      setElapsedTime((prev) => prev + Math.floor((Date.now() - lastStartTime) / 1000));
      setLastStartTime(null);
      setIsRunning(false);
      // Start timeout to auto-end after 10 min
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = window.setTimeout(
        async () => {
          if (sessionId) {
            await endSession(sessionId, new Date().toISOString());
            setSessionId(null);
            setElapsedTime(0);
            setLastStartTime(null);
          }
        },
        10 * 60 * 1000
      );
    }
  };

  // End/reset timer
  const reset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLastStartTime(null);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (sessionId) {
      endSession(sessionId, new Date().toISOString());
      setSessionId(null);
    }
  };

  // Interval effect: update elapsedTime based on Date.now()
  useEffect(() => {
    if (isRunning && lastStartTime) {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + Math.floor((Date.now() - lastStartTime) / 1000));
        setLastStartTime(Date.now());
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, lastStartTime]);

  // Cleanup pause timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, []);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <YStack alignItems="center" gap="$2">
      <SizableText size="$10">{format(elapsedTime)}</SizableText>
      <YStack flexDirection="row" gap="$2">
        <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? pause : start} />
        <Button title="End" onPress={reset} />
      </YStack>
    </YStack>
  );
}

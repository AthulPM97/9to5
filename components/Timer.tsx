import { useState, useRef, useEffect } from 'react';
import { YStack, SizableText } from 'tamagui';
import { Button } from './Button';
import { createSession } from '~/utils/supabase';

export function Timer({ userId }: { userId: string | null }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = async () => {
    if (!running && userId) {
      setRunning(true);
      // Create session in Supabase
      const now = new Date().toISOString();
      try {
        await createSession(userId, now);
      } catch (e) {
        // handle error (optional)
      }
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const pause = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    pause();
    setSeconds(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <YStack alignItems="center" gap="$2">
      <SizableText size="$10">{format(seconds)}</SizableText>
      <YStack flexDirection="row" gap="$2">
        <Button title={running ? 'Pause' : 'Start'} onPress={running ? pause : start} />
        <Button title="End" onPress={reset} />
      </YStack>
    </YStack>
  );
}

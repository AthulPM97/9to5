import { useState, useRef, useEffect } from 'react';
import { YStack, SizableText } from 'tamagui';
import { Button } from './Button';

export function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (!running) {
      setRunning(true);
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
        <Button title={running ? "Pause" : "Start"} onPress={running ? pause : start} />
        <Button title="End" onPress={reset} />
      </YStack>
    </YStack>
  );
}
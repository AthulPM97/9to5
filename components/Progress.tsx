import { useState } from 'react';
import { Progress } from 'tamagui';
import type { SizeTokens } from 'tamagui';

export default function ProgressDemo() {
  const [size, setSize] = useState(4);
  const sizeProp = `$${size}` as SizeTokens;

  return (
    <Progress key={0} size={sizeProp} value={60}>
      <Progress.Indicator animation="bouncy" />
    </Progress>
  );
}

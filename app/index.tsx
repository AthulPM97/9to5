import { Stack, Link } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Timer } from '~/components/Timer';
import { fetchDailySummary, login } from '~/utils/supabase';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState(null);

  useEffect(() => {
    async function startUp() {
      const userId = await login();
      if (userId) {
        console.log('user id ', userId);
        setUserId(userId);
        // You can now fetch the daily summary here if needed
        // const summary = await fetchDailySummary(userId, todayDate);
      }
    }
    startUp();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (userId) {
      fetchDailySummary(userId, today)
        .then(setDailySummary)
        .catch((err) => {
          console.error('Failed to fetch daily summary:', err);
        });
    }
    // login().then((value) => console.log(value)).catch(err => console.log(err))
  }, []);
  console.log("daily ", dailySummary)

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home">
          <Timer />
        </ScreenContent>
        {/* <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link> */}
      </Container>
    </>
  );
}

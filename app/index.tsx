import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, Text } from 'react-native';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { Timer } from '~/components/Timer';
import { fetchDailySummary, login, setDailyTarget } from '~/utils/supabase';

const hourOptions = [4, 5, 6, 7, 8, 8.5, 9];

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState<number | null>(null);

  useEffect(() => {
    async function startUp() {
      const userId = await login();
      if (userId) {
        setUserId(userId);
        const today = new Date().toISOString().slice(0, 10);
        const summary = await fetchDailySummary(userId, today);
        setDailySummary(summary);
        if (!summary) setShowTargetModal(true);
      }
    }
    startUp();
  }, []);

  const handleSetTarget = async () => {
    if (!userId || selectedHours == null) return;
    const today = new Date().toISOString().slice(0, 10);
    const minutes = Math.round(selectedHours * 60);
    const summary = await setDailyTarget(userId, today, minutes);
    setDailySummary(summary);
    setShowTargetModal(false);
    setSelectedHours(null);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home">
          <Timer userId={userId} />
        </ScreenContent>
      </Container>
      <Modal visible={showTargetModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0008',
          }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
              Set your daily target
            </Text>
            {hourOptions.map((h) => (
              <TouchableOpacity
                key={h}
                style={{
                  padding: 12,
                  marginVertical: 4,
                  backgroundColor: selectedHours === h ? '#007AFF' : '#eee',
                  borderRadius: 6,
                  minWidth: 180,
                  alignItems: 'center',
                }}
                onPress={() => setSelectedHours(h)}>
                <Text style={{ color: selectedHours === h ? 'white' : '#333', fontSize: 16 }}>
                  {h} hours ({Math.round(h * 60)} min)
                </Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Save Target"
              onPress={handleSetTarget}
              disabled={selectedHours == null}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

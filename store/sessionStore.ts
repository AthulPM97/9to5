import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: (session) => {
        const updated = [...get().sessions, { ...session, synced: false }];
        set({ sessions: updated });
      },
      markSynced: (sessionId) => {
        const updated = get().sessions.map((s) =>
          s.id === sessionId ? { ...s, synced: true } : s
        );
        set({ sessions: updated });
      },
      clearSynced: () => {
        const unsynced = get().sessions.filter((s) => !s.synced);
        set({ sessions: unsynced });
      },
    }),
    {
      name: 'session-storage',
      getStorage: () => AsyncStorage,
    }
  )
);

import { useState, useRef, useEffect } from 'react';
import { YStack, SizableText } from 'tamagui';
import { Button } from './Button';
import { createSession, endSession, updateDailySummary } from '~/utils/supabase';
import { SessionNoteModal } from './SessionNoteModal';
import { formatTime } from '~/utils/formatTime';
import { SectionSelectionModal } from './SectionSelectionModal';

export function Timer({ userId }: { userId: string | null }) {
  const [elapsedTime, setElapsedTime] = useState(0); // total time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [lastStartTime, setLastStartTime] = useState<number | null>(null); // ms timestamp
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);

  // Start or resume timer
  const start = async () => {
    if (!isRunning && userId) {
      // If section not selected, open section modal first
      if (!selectedSection) {
        setShowSectionModal(true);
        return;
      }
      // Create session if needed
      if (!sessionId) {
        const now = new Date().toISOString();
        try {
          const session = await createSession(userId, now, selectedSection);
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
          if (sessionId && userId) {
            const endTime = new Date().toISOString();
            const minutes = Math.round(elapsedTime / 60);
            // Update session table with duration_minutes
            await endSession(sessionId, endTime, minutes, 'Pause exceeded 10 minutes');
            // Update daily summary with completed_minutes and session count
            const today = endTime.slice(0, 10);
            if (minutes > 0) {
              await updateDailySummary(userId, today, minutes);
            }
            setSessionId(null);
            setElapsedTime(0);
            setLastStartTime(null);
          }
        },
        10 * 60 * 1000
      );
    }
  };

  // End/reset timer: open modal for note input
  const reset = () => {
    setIsRunning(false);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    setSelectedSection(null);
    setShowNoteModal(true); // Open modal for note input
  };

  // Handle note submission and session/daily summary update
  const handleSaveNote = async () => {
    if (sessionId && userId) {
      const endTime = new Date().toISOString();
      const minutes = Math.round(elapsedTime / 60);
      // Update session table with duration_minutes and note
      await endSession(sessionId, endTime, minutes, noteInput.trim());
      // Update daily summary with completed_minutes and session count
      const today = endTime.slice(0, 10);
      if (minutes > 0) {
        await updateDailySummary(userId, today, minutes);
      }
      setSessionId(null);
    }
    setElapsedTime(0);
    setLastStartTime(null);
    setNoteInput('');
    setShowNoteModal(false); // Close modal
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

  return (
    <>
      <YStack alignItems="center" gap="$2">
        <SizableText size="$10">{formatTime(elapsedTime)}</SizableText>
        <YStack flexDirection="row" gap="$2">
          <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? pause : start} />
          <Button title="End" onPress={reset} />
        </YStack>
      </YStack>
      <SectionSelectionModal
        visible={showSectionModal}
        selectedSection={selectedSection}
        onSelect={(section) => {
          setSelectedSection(section);
          setShowSectionModal(false);
          setTimeout(start, 0);
        }}
        onClose={() => setShowSectionModal(false)}
      />
      <SessionNoteModal
        visible={showNoteModal}
        note={noteInput}
        setNote={setNoteInput}
        onSave={handleSaveNote}
      />
    </>
  );
}

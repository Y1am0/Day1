import { useState, useCallback } from 'react';
import { Habit } from '@/types';

export function useFloatingMessage(habits: Habit[]) {
  const [floatingMessage, setFloatingMessage] = useState<{
    message: string;
    position: { top: number };
  } | null>(null);

  const updateFloatingMessagePosition = useCallback(() => {
    if (floatingMessage) {
      const habitIndex = habits.findIndex(
        (h) => h.name === floatingMessage.message.replace("Added habit: ", "")
      );
      if (habitIndex !== -1) {
        const habitHeight = 100;
        const topOffset = 100;
        const newPosition = { top: topOffset + habitIndex * habitHeight };
        if (newPosition.top !== floatingMessage.position.top) {
          setFloatingMessage((prev) =>
            prev ? { ...prev, position: newPosition } : null
          );
        }
      }
    }
  }, [habits, floatingMessage]);

  const showFloatingMessage = (message: string, position: { top: number }) => {
    setFloatingMessage({ message, position });
  };

  return {
    floatingMessage,
    setFloatingMessage,
    updateFloatingMessagePosition,
    showFloatingMessage,
  };
}

import React from 'react';
import { DIFFICULTY_COLORS } from '@/app/constants';
import { HabitDifficultyProps } from '@/types';


const HabitDifficulty: React.FC<HabitDifficultyProps> = ({ difficulty }) => {
  return (
    <span className={`text-xs px-2 py-1 text-neutral-50 rounded-full ${DIFFICULTY_COLORS[difficulty]} transition-colors duration-300`}>
      {difficulty}
    </span>
  );
};

export default HabitDifficulty;

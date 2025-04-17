
import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Shuffle } from 'lucide-react';

interface PokerCardProps {
  id: string;
  value: string;
  type: 'fibonacci' | 'joker' | 'mystery';
  isSelected?: boolean;
  isRevealed?: boolean;
}

const PokerCard: React.FC<PokerCardProps> = ({ 
  id, 
  value, 
  type,
  isSelected = false,
  isRevealed = false
}) => {
  const { setNodeRef } = useDroppable({ id });
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Define card colors based on type and theme
  let cardColors = {
    borderColor: 'border-neon-cyan',
    textColor: 'text-neon-cyan',
    bgGradient: isDarkMode ? 'from-retro-dark to-retro-medium' : 'from-white to-gray-100'
  };

  if (type === 'joker') {
    cardColors = {
      borderColor: 'border-neon-magenta',
      textColor: 'text-neon-magenta',
      bgGradient: isDarkMode ? 'from-retro-dark to-retro-dark' : 'from-white to-gray-100'
    };
  } else if (type === 'mystery') {
    cardColors = {
      borderColor: 'border-neon-yellow',
      textColor: 'text-neon-yellow',
      bgGradient: isDarkMode ? 'from-retro-dark to-retro-dark' : 'from-white to-gray-100'
    };
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        relative h-40 w-28 rounded-lg transform transition-all duration-300 cursor-pointer
        border-2 ${cardColors.borderColor} 
        bg-linear-to-br ${cardColors.bgGradient}
        ${isSelected ? 'scale-110 shadow-[0_0_15px_rgba(var(--neon-cyan-rgb),0.5)]' : 'hover:scale-105'}
        ${isRevealed ? 'rotate-0' : 'rotate-0'}
      `}
    >
      {/* Card corners */}
      <div className={`absolute top-2 left-2 ${cardColors.textColor} font-bold text-lg`}>
        {value}
      </div>
      <div className={`absolute bottom-2 right-2 ${cardColors.textColor} font-bold text-lg rotate-180`}>
        {value}
      </div>
      
      {/* Card center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {type === 'fibonacci' && (
          <div className={`text-5xl font-bold ${cardColors.textColor}`}>
            {value}
          </div>
        )}
        
        {type === 'joker' && (
          <Shuffle className={`h-16 w-16 ${cardColors.textColor}`} />
        )}
        
        {type === 'mystery' && (
          <div className={`text-5xl font-bold ${cardColors.textColor}`}>
            ?
          </div>
        )}
      </div>
      
      {/* Card decoration */}
      <div className="absolute inset-3 border border-dashed border-opacity-30 rounded pointer-events-none"></div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-neon-cyan rounded-full animate-pulse"></div>
      )}
      
      {/* Grid pattern overlay for retro feel */}
      <div className="absolute inset-0 opacity-5 bg-grid-pattern pointer-events-none"></div>
    </div>
  );
};

export default PokerCard;

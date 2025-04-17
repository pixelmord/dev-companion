
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';
import { ArrowLeft } from 'lucide-react';

interface MatrixQuadrantProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tasks: Task[];
  className?: string;
  onReturnTask: (taskId: string) => void;
}

const MatrixQuadrant: React.FC<MatrixQuadrantProps> = ({ 
  id, 
  title, 
  description, 
  icon,
  tasks, 
  className = '',
  onReturnTask
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`retro-card p-4 ${className} ${isOver ? 'bg-retro-light/30' : ''} flex flex-col h-full transition-colors duration-200`}
    >
      <div className="flex items-center mb-3">
        <div className="mr-2">{icon}</div>
        <div>
          <h3 className="text-lg font-pixel text-white">{title}</h3>
          <p className="text-xs text-white/60">{description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center border border-dashed border-retro-light/40 rounded-md">
            <p className="text-sm text-white/40">Drop tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} />
                <button 
                  onClick={() => onReturnTask(task.id)}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-retro-medium rounded-full hover:bg-retro-light"
                  title="Return to sidebar"
                >
                  <ArrowLeft size={14} className="text-white/80" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixQuadrant;

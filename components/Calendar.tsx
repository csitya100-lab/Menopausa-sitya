import React, { useState } from 'react';
import { DailyLog } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  logs: Record<string, DailyLog>;
  onDateSelect: (date: string) => void;
}

export const Calendar: React.FC<Props> = ({ logs, onDateSelect }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getSeverityColor = (log?: DailyLog) => {
    if (!log) return 'bg-stone-50 dark:bg-stone-800/50 text-stone-400 dark:text-stone-600 border-transparent';
    
    let score = 0;
    if (log.mood === 'normal') score += 2;
    if (log.mood === 'hard') score += 4;
    score += log.symptoms.length * 0.5;

    // Heatmap logic
    if (log.mood === 'great' && log.symptoms.length < 2) return 'bg-teal-400 text-white border-teal-500 shadow-sm';
    if (score < 4) return 'bg-amber-300 text-amber-900 border-amber-400 shadow-sm';
    if (score < 7) return 'bg-orange-400 text-white border-orange-500 shadow-sm';
    return 'bg-rose-500 text-white border-rose-600 shadow-sm';
  };

  const days = [];
  // Empty slots
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = logs[dateStr];
    days.push(
      <button 
        key={d} 
        onClick={() => onDateSelect(dateStr)}
        className={`aspect-square rounded-xl m-0.5 flex items-center justify-center text-xs font-bold transition-transform active:scale-95 border ${getSeverityColor(log)}`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-600 dark:text-stone-300" />
        </button>
        <span className="font-bold text-stone-800 dark:text-stone-100 capitalize text-lg">{monthName}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-stone-600 dark:text-stone-300" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D','S','T','Q','Q','S','S'].map(d => (
            <div key={d} className="text-center text-xs text-stone-400 dark:text-stone-500 font-bold">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {days}
      </div>

      <div className="flex justify-center gap-4 mt-6 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm"/> Ótimo</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-sm"/> Médio</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm"/> Intenso</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"/> Difícil</div>
      </div>
    </div>
  );
};
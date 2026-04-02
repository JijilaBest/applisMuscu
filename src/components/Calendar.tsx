import React from 'react';
import { X, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkoutSession } from '../types';

interface CalendarProps {
  history: WorkoutSession[];
  onClose: () => void;
  userColor: string;
}

const Calendar: React.FC<CalendarProps> = ({ history, onClose, userColor }) => {
  const [viewDate, setViewDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const totalDays = daysInMonth(currentYear, currentMonth);
  const offset = (firstDayOfMonth(currentYear, currentMonth) + 6) % 7; // Adjust to start on Monday

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: offset }, (_, i) => i);

  // Check if a day has a workout
  const hasWorkout = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return history.some(session => session.date === dateString);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

  return (
    <div className="modal-backdrop flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card flex-col gap-6 w-full max-w-md" onClick={e => e.stopPropagation()} 
        style={{ 
          background: 'var(--bg-secondary)', 
          border: `3px solid ${userColor}`,
          boxShadow: `8px 8px 0px ${userColor}`,
          position: 'relative',
          padding: '2rem'
        }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div className="flex items-center justify-between">
          <h3 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex gap-2">
            <button className="btn-icon" onClick={() => changeMonth(-1)} style={{ width: '32px', height: '32px' }}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn-icon" onClick={() => changeMonth(1)} style={{ width: '32px', height: '32px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '8px', 
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: '0.5rem'
        }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '8px' 
        }}>
          {prevMonthDays.map(i => <div key={`p-${i}`} />)}
          {days.map(day => {
            const active = hasWorkout(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
            
            return (
              <div key={day} className="flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  background: active ? `${userColor}20` : isToday ? 'var(--border-glass)' : 'rgba(255, 255, 255, 0.05)',
                  border: active ? `2px solid ${userColor}` : '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: active ? userColor : 'var(--text-main)',
                  fontWeight: active || isToday ? 800 : 400,
                  fontSize: '0.9rem',
                  position: 'relative',
                  boxShadow: active ? `2px 2px 0px ${userColor}` : 'none'
                }}>
                  {day}
                  {active && (
                    <Flame size={12} fill={userColor} stroke="none" style={{ position: 'absolute', top: '-4px', right: '-4px', animation: 'pulse 2s infinite' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px dashed var(--border-glass)', fontSize: '0.85rem' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', background: `${userColor}20`, border: `1px solid ${userColor}`, borderRadius: '3px' }} />
            <span>Séance faite</span>
          </div>
          <Flame size={14} color={userColor} />
          <span style={{ fontWeight: 700, color: userColor }}>
            {history.filter(s => s.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length} séances ce mois
          </span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame } from 'lucide-react';
import type { UserProfile } from '../types';
import type { AppUser } from '../store/useStore';

interface DashboardProps {
  currentUser: UserProfile;
  appUser?: AppUser;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, appUser }) => {
  const [metric, setMetric] = useState<'volume' | 'reps' | 'max'>('volume');

  // Use history from appUser (store) or fallback to empty
  const history = appUser?.history || [];

  const chartData = useMemo(() => {
    return history.map(session => {
      let totalVolume = 0;
      let totalReps = 0;
      let maxWeight = 0;

      session.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            totalVolume += set.reps * set.weight;
            totalReps += set.reps;
            if (set.weight > maxWeight) maxWeight = set.weight;
          }
        });
      });
      return {
        date: session.date.substring(5),
        value: metric === 'volume' ? totalVolume : metric === 'reps' ? totalReps : maxWeight
      };
    }).reverse();
  }, [metric, history]);

  const firstName = currentUser.name.split(' ')[0];
  const userColor = appUser?.color || 'var(--primary)';

  return (
    <div className="flex-col gap-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-gradient">Bienvenue, {firstName}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Prêt(e) à tout donner aujourd'hui ?</p>
        </div>
        <div className="glass-card flex items-center justify-center gap-2" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
          <Flame color={userColor} size={24} />
          <div className="flex-col">
            <span style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{history.length}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ce Mois</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className="glass-card flex-col gap-2" style={{ minWidth: '140px', flex: 1 }}>
          <div className="flex items-center gap-2 text-muted">
            <Activity size={16} /> <span style={{ fontSize: '0.8rem' }}>Séances</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {currentUser.workoutsCompleted}
          </div>
        </div>
      </div>

      <div className="glass-card flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: '1.4rem' }}>Progression</h3>
        </div>

        {history.length === 0 ? (
          <div className="flex-col items-center justify-center py-10 gap-3 text-center">
            <Activity size={32} className="text-muted" opacity={0.3} />
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Aucune donnée pour l'instant.<br/>Commence ta première séance !</p>
          </div>
        ) : (
          <>
            <div className="flex" style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              <button 
                onClick={() => setMetric('volume')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: metric === 'volume' ? userColor : 'transparent', color: metric === 'volume' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.85rem' }}
              >
                Volume (kg)
              </button>
              <button 
                onClick={() => setMetric('reps')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: metric === 'reps' ? userColor : 'transparent', color: metric === 'reps' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.85rem' }}
              >
                Séries/Reps
              </button>
              <button 
                onClick={() => setMetric('max')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: metric === 'max' ? userColor : 'transparent', color: metric === 'max' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.85rem' }}
              >
                Max (kg)
              </button>
            </div>
            
            <div style={{ height: '240px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(val) => metric === 'volume' ? `${val/1000}k` : val} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '2px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      boxShadow: 'var(--shadow-retro)'
                    }}
                    itemStyle={{ color: userColor, fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={userColor} 
                    strokeWidth={3}
                    dot={{ r: 6, fill: 'var(--bg-secondary)', stroke: userColor, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: userColor, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {history.length > 0 && (
        <div className="flex-col gap-4 mt-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Activité Récente</h3>
          <div className="flex-col gap-3">
            {history.slice(0, 3).map(session => (
              <div key={session.id} className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
                <div className="flex items-center gap-3">
                  <div className="btn-icon" style={{ width: '40px', height: '40px', background: `${userColor}20` }}>
                    <Activity size={18} color={userColor} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{session.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{session.date} • {session.durationMinutes} min</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: userColor }}>
                  {session.exercises.length} Exercices
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

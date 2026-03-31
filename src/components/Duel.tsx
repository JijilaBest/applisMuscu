import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Swords, Flame, Trophy, TrendingUp } from 'lucide-react';
import type { WorkoutSession, UserProfile } from '../types';
import type { AppUser } from '../store/useStore';

type DuelMetric = 'volume' | 'reps';

const computeStats = (sessions: WorkoutSession[]) => {
  return sessions.map(session => {
    let totalVolume = 0;
    let totalReps = 0;
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += set.reps * set.weight;
          totalReps += set.reps;
        }
      });
    });
    return { date: session.date.substring(5), totalVolume, totalReps };
  });
};

interface DuelProps {
  currentUser: UserProfile;
  allUsers: AppUser[];
}

const Duel: React.FC<DuelProps> = ({ currentUser, allUsers }) => {
  const [metric, setMetric] = useState<DuelMetric>('volume');
  
  // Find current user data in store
  const me = allUsers.find(u => u.profile.id === currentUser.id) || allUsers[0];
  
  // State for chosen opponent (default to first other user, or Ronan if exists)
  const others = allUsers.filter(u => u.profile.id !== currentUser.id);
  const [opponentId, setOpponentId] = useState<string>(() => {
    const ronan = others.find(u => u.profile.name.toLowerCase().includes('ronan'));
    return ronan ? ronan.profile.id : (others[0]?.profile.id || '');
  });

  const opponent = others.find(u => u.profile.id === opponentId) || others[0];

  const myStats = useMemo(() => computeStats(me.history), [me.history]);
  const opStats = useMemo(() => computeStats(opponent?.history || []), [opponent?.history]);

  // Merge data by date for the chart
  const chartData = useMemo(() => {
    if (!opponent) return [];
    const allDates = new Set([
      ...myStats.map(s => s.date),
      ...opStats.map(s => s.date),
    ]);
    const sorted = Array.from(allDates).sort();
    return sorted.map(date => {
      const m = myStats.find(s => s.date === date);
      const o = opStats.find(s => s.date === date);
      return {
        date,
        [me.profile.name]: m ? (metric === 'volume' ? m.totalVolume : m.totalReps) : null,
        [opponent.profile.name]: o ? (metric === 'volume' ? o.totalVolume : o.totalReps) : null,
      };
    });
  }, [metric, myStats, opStats, me.profile.name, opponent]);

  // Overall totals
  const myTotalVol = myStats.reduce((a, s) => a + s.totalVolume, 0);
  const opTotalVol = opStats.reduce((a, s) => a + s.totalVolume, 0);
  const myTotalReps = myStats.reduce((a, s) => a + s.totalReps, 0);
  const opTotalReps = opStats.reduce((a, s) => a + s.totalReps, 0);

  // Progression % (first to last session)
  const progression = (stats: { totalVolume: number; totalReps: number }[], field: 'totalVolume' | 'totalReps') => {
    if (stats.length < 2) return 0;
    const first = stats[0][field];
    const last = stats[stats.length - 1][field];
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  };
  
  const myProg = progression(myStats, metric === 'volume' ? 'totalVolume' : 'totalReps');
  const opProg = progression(opStats, metric === 'volume' ? 'totalVolume' : 'totalReps');

  const myName = me.profile.name;
  const opName = opponent?.profile.name || 'Adversaire';

  // Who's winning?
  const volWinner = myTotalVol > opTotalVol ? myName : myTotalVol < opTotalVol ? opName : 'Égalité';
  const repsWinner = myTotalReps > opTotalReps ? myName : myTotalReps < opTotalReps ? opName : 'Égalité';
  const progWinner = myProg > opProg ? myName : myProg < opProg ? opName : 'Égalité';

  if (!opponent) {
    return (
      <div className="flex-col items-center justify-center gap-4 py-20 text-center">
        <Swords size={48} className="text-muted" />
        <h2 className="text-gradient">Duel</h2>
        <p className="text-muted">Crée un deuxième profil pour pouvoir faire un duel !</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <Swords size={28} color="var(--primary)" />
        <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>Duel</h2>
      </div>

      {/* VS Card & Opponent Selection */}
      <div className="glass-card flex-col gap-6" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-around w-full">
          {/* Me */}
          <div className="flex-col items-center gap-2">
            <div style={{
              width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
              background: me.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff',
              border: `3px solid ${me.borderColor}`, boxShadow: `3px 3px 0px ${me.borderColor}`
            }}>
              {me.profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{myName}</div>
          </div>

          <div style={{
            fontSize: '1.8rem', fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}>VS</div>

          {/* Opponent */}
          <div className="flex-col items-center gap-2">
            <div style={{
              width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
              background: opponent.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff',
              border: `3px solid ${opponent.borderColor}`, boxShadow: `3px 3px 0px ${opponent.borderColor}`
            }}>
              {opponent.profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opName}</div>
          </div>
        </div>

        {/* Opponent Selector */}
        <div className="flex-col gap-2">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>CHOISIR L'ADVERSAIRE</span>
          <div className="flex gap-3 justify-center overflow-x-auto py-1">
            {others.map(user => (
              <button
                key={user.profile.id}
                onClick={() => setOpponentId(user.profile.id)}
                style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
                  background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#fff',
                  border: `2px solid ${opponentId === user.profile.id ? 'var(--primary)' : 'transparent'}`,
                  opacity: opponentId === user.profile.id ? 1 : 0.5,
                  transform: opponentId === user.profile.id ? 'scale(1.1)' : 'scale(0.9)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {user.profile.name.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex" style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
        <button onClick={() => setMetric('volume')} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: metric === 'volume' ? 'var(--primary)' : 'transparent', color: metric === 'volume' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.9rem' }}>
          📊 Volume (kg)
        </button>
        <button onClick={() => setMetric('reps')} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: metric === 'reps' ? 'var(--primary)' : 'transparent', color: metric === 'reps' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.9rem' }}>
          🔁 Séries/Reps
        </button>
      </div>

      <div className="glass-card flex-col gap-4">
        <h3 style={{ fontSize: '1.2rem' }}>Progression {metric === 'volume' ? 'Volume' : 'Reps'}</h3>
        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => metric === 'volume' ? `${(val / 1000).toFixed(1)}k` : val} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-main)', boxShadow: 'var(--shadow-retro)' }} itemStyle={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.85rem', fontWeight: 600 }} />
              <Line type="monotone" dataKey={me.profile.name} stroke={me.color} strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: me.color, strokeWidth: 2 }} connectNulls />
              <Line type="monotone" dataKey={opponent.profile.name} stroke={opponent.color} strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: opponent.color, strokeWidth: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex-col gap-3">
        <h3 style={{ fontSize: '1.1rem' }}>Scores</h3>
        
        {/* Volume comparison */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2"><Flame size={18} color="var(--primary)" /><span style={{ fontWeight: 600 }}>Volume Total</span></div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{myName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: me.color }}>{(myTotalVol / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: opponent.color }}>{(opTotalVol / 1000).toFixed(1)}k</span>
            </div>
          </div>
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: opponent.color, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(myTotalVol / (myTotalVol + opTotalVol || 1)) * 100}%`, background: me.color, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Reps comparison */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2"><TrendingUp size={18} color="var(--secondary)" /><span style={{ fontWeight: 600 }}>Reps Totales</span></div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{myName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: me.color }}>{myTotalReps}</span>
            </div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: opponent.color }}>{opTotalReps}</span>
            </div>
          </div>
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: opponent.color, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(myTotalReps / (myTotalReps + opTotalReps || 1)) * 100}%`, background: me.color, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Progression comparison */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2"><Trophy size={18} color="var(--warning)" /><span style={{ fontWeight: 600 }}>Progression {metric === 'volume' ? 'Volume' : 'Reps'}</span></div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{myName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: myProg >= 0 ? 'var(--success)' : 'var(--danger)' }}>{myProg >= 0 ? '+' : ''}{myProg}%</span>
            </div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opName}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: opProg >= 0 ? 'var(--success)' : 'var(--danger)' }}>{opProg >= 0 ? '+' : ''}{opProg}%</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: progWinner === myName ? me.color : progWinner === opName ? opponent.color : 'var(--text-muted)' }}>
            🏆 {progWinner === 'Égalité' ? 'Égalité !' : `${progWinner} progresse le plus !`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Duel;

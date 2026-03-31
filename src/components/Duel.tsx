import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Swords, Flame, Trophy, TrendingUp } from 'lucide-react';
import { mockUser, mockHistory, mockRonan, ronanHistory } from '../store/mockData';
import type { WorkoutSession, UserProfile } from '../types';

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
}

const Duel: React.FC<DuelProps> = ({ currentUser }) => {
  const [metric, setMetric] = useState<DuelMetric>('volume');

  const jiseleStats = useMemo(() => computeStats(mockHistory), []);
  const ronanStats = useMemo(() => computeStats(ronanHistory), []);

  // Merge data by date for the chart
  const chartData = useMemo(() => {
    const allDates = new Set([
      ...jiseleStats.map(s => s.date),
      ...ronanStats.map(s => s.date),
    ]);
    const sorted = Array.from(allDates).sort();
    return sorted.map(date => {
      const j = jiseleStats.find(s => s.date === date);
      const r = ronanStats.find(s => s.date === date);
      return {
        date,
        [mockUser.name.split(' ')[0]]: j ? (metric === 'volume' ? j.totalVolume : j.totalReps) : null,
        [mockRonan.name]: r ? (metric === 'volume' ? r.totalVolume : r.totalReps) : null,
      };
    });
  }, [metric, jiseleStats, ronanStats]);

  // Overall totals
  const jiseleTotalVol = jiseleStats.reduce((a, s) => a + s.totalVolume, 0);
  const ronanTotalVol = ronanStats.reduce((a, s) => a + s.totalVolume, 0);
  const jiseleTotalReps = jiseleStats.reduce((a, s) => a + s.totalReps, 0);
  const ronanTotalReps = ronanStats.reduce((a, s) => a + s.totalReps, 0);

  // Progression % (first to last session)
  const progression = (stats: { totalVolume: number; totalReps: number }[], field: 'totalVolume' | 'totalReps') => {
    if (stats.length < 2) return 0;
    const first = stats[0][field];
    const last = stats[stats.length - 1][field];
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  };
  const jiseleVolProg = progression(jiseleStats, 'totalVolume');
  const ronanVolProg = progression(ronanStats, 'totalVolume');
  const jiseleRepsProg = progression(jiseleStats, 'totalReps');
  const ronanRepsProg = progression(ronanStats, 'totalReps');

  const jName = mockUser.name.split(' ')[0];
  const rName = mockRonan.name;

  // Who's winning?
  const volWinner = jiseleTotalVol > ronanTotalVol ? jName : jiseleTotalVol < ronanTotalVol ? rName : 'Égalité';
  const repsWinner = jiseleTotalReps > ronanTotalReps ? jName : jiseleTotalReps < ronanTotalReps ? rName : 'Égalité';
  const progWinner = metric === 'volume'
    ? (jiseleVolProg > ronanVolProg ? jName : jiseleVolProg < ronanVolProg ? rName : 'Égalité')
    : (jiseleRepsProg > ronanRepsProg ? jName : jiseleRepsProg < ronanRepsProg ? rName : 'Égalité');

  return (
    <div className="flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <Swords size={28} color="var(--primary)" />
        <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>Duel</h2>
      </div>

      {/* VS Card */}
      <div className="glass-card flex items-center justify-around" style={{ padding: '1.5rem' }}>
        {/* Jisele */}
        <div className="flex-col items-center gap-2">
          <div style={{
            width: '60px', height: '60px', borderRadius: 'var(--radius-full)',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff',
            border: '3px solid #FF1493', boxShadow: '3px 3px 0px #FF1493'
          }}>
            {jName.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{jName}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{mockUser.workoutsCompleted} séances</div>
        </div>

        {/* VS */}
        <div style={{
          fontSize: '2rem', fontFamily: 'var(--font-heading)',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}>
          VS
        </div>

        {/* Ronan */}
        <div className="flex-col items-center gap-2">
          <div style={{
            width: '60px', height: '60px', borderRadius: 'var(--radius-full)',
            background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff',
            border: '3px solid #9B59B6', boxShadow: '3px 3px 0px #9B59B6'
          }}>
            {rName.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{rName}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{mockRonan.workoutsCompleted} séances</div>
        </div>
      </div>

      {/* Metric Toggle - Volume / Reps only (no Max) */}
      <div className="flex" style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
        <button
          onClick={() => setMetric('volume')}
          style={{
            flex: 1, padding: '0.6rem', borderRadius: '6px',
            background: metric === 'volume' ? 'var(--primary)' : 'transparent',
            color: metric === 'volume' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, transition: 'all 0.2s', fontSize: '0.9rem'
          }}
        >
          📊 Volume (kg)
        </button>
        <button
          onClick={() => setMetric('reps')}
          style={{
            flex: 1, padding: '0.6rem', borderRadius: '6px',
            background: metric === 'reps' ? 'var(--primary)' : 'transparent',
            color: metric === 'reps' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, transition: 'all 0.2s', fontSize: '0.9rem'
          }}
        >
          🔁 Séries/Reps
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="glass-card flex-col gap-4">
        <h3 style={{ fontSize: '1.2rem' }}>
          Progression {metric === 'volume' ? 'Volume' : 'Reps'}
        </h3>
        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false}
                tickFormatter={(val) => metric === 'volume' ? `${(val / 1000).toFixed(1)}k` : val} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-retro)',
                }}
                itemStyle={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.85rem', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey={jName}
                stroke="#FF69B4"
                strokeWidth={3}
                dot={{ r: 5, fill: '#fff', stroke: '#FF69B4', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#FF69B4', stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={rName}
                stroke="#9B59B6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#fff', stroke: '#9B59B6', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#9B59B6', stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Cards */}
      <div className="flex-col gap-3">
        <h3 style={{ fontSize: '1.1rem' }}>Comparaison</h3>

        {/* Volume total */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2">
            <Flame size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>Volume Total</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jName}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FF69B4' }}>
                {(jiseleTotalVol / 1000).toFixed(1)}k
              </span>
            </div>
            <div style={{ width: '2px', background: 'var(--border-glass)' }}></div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rName}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#9B59B6' }}>
                {(ronanTotalVol / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: '#9B59B6', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(jiseleTotalVol / (jiseleTotalVol + ronanTotalVol)) * 100}%`,
              background: '#FF69B4', borderRadius: '4px', transition: 'width 0.5s'
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: volWinner === jName ? '#FF69B4' : volWinner === rName ? '#9B59B6' : 'var(--text-muted)' }}>
            🏆 {volWinner === 'Égalité' ? 'Égalité !' : `${volWinner} mène !`}
          </div>
        </div>

        {/* Reps totales */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} color="var(--secondary)" />
            <span style={{ fontWeight: 600 }}>Reps Totales</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jName}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FF69B4' }}>{jiseleTotalReps}</span>
            </div>
            <div style={{ width: '2px', background: 'var(--border-glass)' }}></div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rName}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#9B59B6' }}>{ronanTotalReps}</span>
            </div>
          </div>
          <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: '#9B59B6', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(jiseleTotalReps / (jiseleTotalReps + ronanTotalReps)) * 100}%`,
              background: '#FF69B4', borderRadius: '4px', transition: 'width 0.5s'
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: repsWinner === jName ? '#FF69B4' : repsWinner === rName ? '#9B59B6' : 'var(--text-muted)' }}>
            🏆 {repsWinner === 'Égalité' ? 'Égalité !' : `${repsWinner} mène !`}
          </div>
        </div>

        {/* Progression % */}
        <div className="glass-card flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} color="var(--warning)" />
            <span style={{ fontWeight: 600 }}>Progression ({metric === 'volume' ? 'Volume' : 'Reps'})</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jName}</span>
              <span style={{
                fontSize: '1.3rem', fontWeight: 700,
                color: (metric === 'volume' ? jiseleVolProg : jiseleRepsProg) >= 0 ? 'var(--success)' : 'var(--danger)'
              }}>
                {metric === 'volume' ? (jiseleVolProg >= 0 ? '+' : '') + jiseleVolProg : (jiseleRepsProg >= 0 ? '+' : '') + jiseleRepsProg}%
              </span>
            </div>
            <div style={{ width: '2px', background: 'var(--border-glass)' }}></div>
            <div className="flex-col items-center gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rName}</span>
              <span style={{
                fontSize: '1.3rem', fontWeight: 700,
                color: (metric === 'volume' ? ronanVolProg : ronanRepsProg) >= 0 ? 'var(--success)' : 'var(--danger)'
              }}>
                {metric === 'volume' ? (ronanVolProg >= 0 ? '+' : '') + ronanVolProg : (ronanRepsProg >= 0 ? '+' : '') + ronanRepsProg}%
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: progWinner === jName ? '#FF69B4' : progWinner === rName ? '#9B59B6' : 'var(--text-muted)' }}>
            📈 {progWinner === 'Égalité' ? 'Égalité !' : `${progWinner} progresse le plus !`}
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem' }}>
        ⚖️ Comparaison basée sur le volume et les reps uniquement — pas de max car c'est inégal !
      </div>
    </div>
  );
};

export default Duel;

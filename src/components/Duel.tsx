import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Swords, Flame, Trophy, TrendingUp, Map, Flag, Award } from 'lucide-react';
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

const computeTotalCalories = (sessions: WorkoutSession[]) => {
  return sessions.reduce((acc, session) => {
    // Priority 1: Sum manual calories from all exercises
    let manualCal = 0;
    session.exercises.forEach(ex => {
      if (ex.calories) manualCal += ex.calories;
    });

    if (manualCal > 0) return acc + manualCal;

    // Priority 2: Use established session estimate
    if (session.caloriesEstimate) return acc + session.caloriesEstimate;

    // Fallback calculation: Volume * 0.05 + Reps * 2
    let vol = 0;
    let reps = 0;
    session.exercises.forEach(ex => ex.sets.forEach(s => {
      if (s.completed) {
        vol += s.reps * s.weight;
        reps += s.reps;
      }
    }));
    return acc + (vol * 0.05) + (reps * 2);
  }, 0);
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

      {/* ROADMAP & PODIUM */}
      <div className="flex-col gap-6 mt-4">
        <div className="flex items-center gap-2">
          <Map size={24} color="var(--primary)" />
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Piste des Championnes 🏁</h3>
        </div>

        {/* The Track Container */}
        <div className="flex-col gap-2 relative" 
          style={{ 
            padding: '20px 10px', 
            background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 100%)', 
            borderRadius: '16px',
            border: '4px solid #C71585',
            boxShadow: '0 8px 0px #8B008B',
            overflow: 'hidden'
          }}>
          
          {/* Finish Line Checkered */}
          <div style={{ 
            position: 'absolute', right: '40px', top: 0, bottom: 0, width: '20px', 
            backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 10px, #000 10px, #000 20px), repeating-linear-gradient(0deg, #000 0, #000 10px, #fff 10px, #fff 20px)',
            backgroundSize: '10px 20px, 10px 20px',
            backgroundPosition: '0 0, 10px 10px',
            opacity: 0.3, zIndex: 1 
          }} />

          {/* Users on distinct lanes */}
          {allUsers.map((user, idx) => {
            const calories = computeTotalCalories(user.history);
            const maxCalories = 5000; 
            const progress = Math.min(85, (calories / maxCalories) * 85);
            
            return (
              <div key={idx} style={{ 
                height: '70px', 
                position: 'relative',
                background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                marginBottom: '5px',
                width: '100%'
              }}>
                {/* Lane Number */}
                <div style={{ position: 'absolute', left: '10px', top: '10px', fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)' }}>
                  {idx + 1}
                </div>

                {/* Avatar & Label */}
                <div style={{ 
                  position: 'absolute', 
                  left: `${progress}%`, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  transition: 'left 1s ease-in-out',
                  zIndex: 5,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: user.color, border: '3px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', color: '#fff', fontWeight: 900,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                    {user.profile.name.charAt(0)}
                  </div>
                  <div style={{ 
                    marginTop: '2px', padding: '1px 6px', background: 'rgba(0,0,0,0.5)', 
                    borderRadius: '4px', color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {Math.round(calories)} kcal
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Podium Title */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Trophy size={20} color="var(--warning)" />
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)' }}>PODIUM FINAL</h3>
        </div>

        {/* Podium Blocks */}
        <div className="flex justify-center items-end gap-3" style={{ height: '220px', paddingBottom: '1rem' }}>
          {(() => {
            const ranked = [...allUsers]
              .map(u => ({ user: u, cal: computeTotalCalories(u.history) }))
              .sort((a, b) => b.cal - a.cal)
              .slice(0, 3);
            
            // Reorder for visual podium: 2nd, 1st, 3rd
            const visualOrder = [ranked[1], ranked[0], ranked[2]].filter(x => x);

            return visualOrder.map((item, idx) => {
              const place = ranked.indexOf(item) + 1;
              const height = place === 1 ? '160px' : place === 2 ? '120px' : '90px';
              const color = place === 1 ? '#FFD700' : place === 2 ? '#E0E0E0' : '#CD7F32';
              const podiumBg = place === 1 ? 'linear-gradient(180deg, #FFF9C4 0%, #FDD835 100%)' : place === 2 ? 'linear-gradient(180deg, #F5F5F5 0%, #BDBDBD 100%)' : 'linear-gradient(180deg, #FFE0B2 0%, #FB8C00 100%)';
              
              return (
                <div key={idx} className="flex-col items-center gap-0" style={{ flex: 1, maxWidth: '110px' }}>
                  {/* Winner Avatar */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: item.user.color, border: '4px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', color: '#fff', fontWeight: 900,
                    marginBottom: '-15px', zIndex: 5,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    animation: place === 1 ? 'bounce 2s infinite' : 'none'
                  }}>
                    {item.user.profile.name.charAt(0)}
                  </div>
                  
                  {/* Podium Column */}
                  <div style={{
                    width: '100%', height, 
                    background: podiumBg,
                    border: '3px solid #fff', borderRadius: '12px 12px 4px 4px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                    boxShadow: `0 8px 0px ${color}88, var(--shadow-retro)`, 
                    zIndex: 2, position: 'relative',
                    paddingTop: '20px'
                  }}>
                    {place === 1 && <Flame size={20} color="#FF5722" style={{ position: 'absolute', top: '-25px' }} />}
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', background: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color, fontWeight: 900, fontSize: '1.2rem', marginBottom: '5px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {place}
                    </div>
                    <div style={{ 
                        fontSize: '0.75rem', fontWeight: 800, color: 'rgba(0,0,0,0.6)',
                        background: 'rgba(255,255,255,0.4)', padding: '2px 8px', borderRadius: '10px'
                    }}>
                      {Math.round(item.cal)}
                    </div>
                    <Award size={28} color="#fff" style={{ marginTop: 'auto', marginBottom: '10px', opacity: 0.8 }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', marginTop: '8px', color: 'var(--text-main)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.user.profile.name}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default Duel;

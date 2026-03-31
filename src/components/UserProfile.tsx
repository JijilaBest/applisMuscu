import React from 'react';
import { Award, Target, Settings, ChevronRight, LogOut } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';
import type { AppUser } from '../store/useStore';

interface UserProfileProps {
  currentUser: UserProfileType;
  appUser?: AppUser;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, appUser, onLogout }) => {
  const avatarBg = appUser?.color || 'var(--primary)';
  const borderColor = appUser?.borderColor || '#FF1493';
  const history = appUser?.history || [];

  // Calculate total volume
  const totalVolume = history.reduce((acc, session) => {
    let sessionVol = 0;
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) sessionVol += set.reps * set.weight;
      });
    });
    return acc + sessionVol;
  }, 0);

  return (
    <div className="flex-col gap-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>Profil</h2>
        <div className="btn-icon">
          <Settings size={20} />
        </div>
      </div>

      <div className="flex-col items-center justify-center gap-2 mb-4">
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: 'var(--radius-full)',
          background: avatarBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
          fontFamily: 'var(--font-heading)',
          color: '#fff',
          border: `4px solid ${borderColor}`,
          boxShadow: `4px 4px 0px ${borderColor}`
        }}>
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '0.5rem' }}>{currentUser.name}</h3>
      </div>

      <div className="glass-card flex justify-around">
        <div className="flex-col items-center gap-1">
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Séances</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{currentUser.workoutsCompleted}</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-glass)' }}></div>
        <div className="flex-col items-center gap-1">
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Volume Total</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(totalVolume / 1000).toFixed(1)}k kg</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-glass)' }}></div>
        <div className="flex-col items-center gap-1">
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Série</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{Math.min(history.length, 7)} Jours</span>
        </div>
      </div>

      <div className="flex-col gap-3 mt-4">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Accomplissements</h4>
        
        {history.length === 0 ? (
          <div className="glass-card flex items-center justify-center py-6 text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            Aucun accomplissement encore. Continue comme ça !
          </div>
        ) : (
          <>
            <div className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-3">
                <div className="btn-icon" style={{ background: 'rgba(255, 234, 0, 0.1)', borderColor: 'rgba(255, 234, 0, 0.2)' }}>
                  <Award size={20} color="var(--warning)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Club des {totalVolume > 5000 ? '100' : '50'}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Volume total atteint : {(totalVolume/1000).toFixed(1)}k kg</div>
                </div>
              </div>
            </div>

            <div className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-3">
                <div className="btn-icon" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(0, 229, 255, 0.2)' }}>
                  <Target size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Départ Lancé</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Première séance complétée !</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-col gap-3 mt-4">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Réglages & Préférences</h4>
        <div className="glass-card flex-col" style={{ padding: '0' }}>
          <button className="flex items-center justify-between" style={{ padding: '1rem', width: '100%', borderBottom: '1px solid var(--border-glass)' }}>
            <span>Modifier le Profil</span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <button className="flex items-center justify-between" style={{ padding: '1rem', width: '100%', borderBottom: '1px solid var(--border-glass)' }}>
            <span>Unités de Mesure (kg/cm)</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Métrique</span>
          </button>
          <button onClick={onLogout} className="flex items-center justify-between" style={{ padding: '1rem', width: '100%' }}>
            <span className="flex items-center gap-2" style={{ color: 'var(--danger)' }}>
              <LogOut size={16} /> Changer de Profil
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

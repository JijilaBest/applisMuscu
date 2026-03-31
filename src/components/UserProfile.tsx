import React from 'react';
import { Award, Target, Settings, ChevronRight, LogOut } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  currentUser: UserProfileType;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onLogout }) => {
  const isJisele = currentUser.id === 'user-1';
  const avatarBg = isJisele ? 'var(--primary)' : 'var(--secondary)';
  const borderColor = isJisele ? '#FF1493' : '#9B59B6';

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
          {currentUser.name.charAt(0)}
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
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{isJisele ? '10.5k' : '10.8k'} kg</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-glass)' }}></div>
        <div className="flex-col items-center gap-1">
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Série</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{isJisele ? '4' : '3'} Jours</span>
        </div>
      </div>

      <div className="flex-col gap-3 mt-4">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Accomplissements</h4>
        
        <div className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="btn-icon" style={{ background: 'rgba(255, 234, 0, 0.1)', borderColor: 'rgba(255, 234, 0, 0.2)' }}>
              <Award size={20} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Club des 100</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>100kg au Développé Couché atteint</div>
            </div>
          </div>
        </div>

        <div className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="btn-icon" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(0, 229, 255, 0.2)' }}>
              <Target size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>La Régularité Paye</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>4 séances en une semaine</div>
            </div>
          </div>
        </div>
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


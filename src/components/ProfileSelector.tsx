import React from 'react';
import { mockUser, mockRonan } from '../store/mockData';
import type { UserProfile } from '../types';

interface ProfileSelectorProps {
  onSelect: (profile: UserProfile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelect }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '2rem',
    }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', textAlign: 'center' }}>Baddys</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'center', maxWidth: '300px' }}>
        Qui est-ce ? Choisis ton profil pour commencer 💪
      </p>

      <div className="flex gap-6" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Jisele */}
        <button
          onClick={() => onSelect(mockUser)}
          className="glass-card flex-col items-center gap-3"
          style={{
            padding: '2rem 2.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '180px',
          }}
        >
          <div style={{
            width: '90px', height: '90px', borderRadius: 'var(--radius-full)',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontFamily: 'var(--font-heading)', color: '#fff',
            border: '4px solid #FF1493', boxShadow: '4px 4px 0px #FF1493',
          }}>
            {mockUser.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-main)' }}>
            {mockUser.name.split(' ')[0]}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            {mockUser.workoutsCompleted} séances
          </div>
        </button>

        {/* Ronan */}
        <button
          onClick={() => onSelect(mockRonan)}
          className="glass-card flex-col items-center gap-3"
          style={{
            padding: '2rem 2.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '180px',
          }}
        >
          <div style={{
            width: '90px', height: '90px', borderRadius: 'var(--radius-full)',
            background: 'var(--secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontFamily: 'var(--font-heading)', color: '#fff',
            border: '4px solid #9B59B6', boxShadow: '4px 4px 0px #9B59B6',
          }}>
            {mockRonan.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-main)' }}>
            {mockRonan.name}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            {mockRonan.workoutsCompleted} séances
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;

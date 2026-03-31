import React from 'react';
import { Home, Swords, User, Plus } from 'lucide-react';
import type { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onLogout }) => {
  const isJisele = currentUser.id === 'user-1';
  const avatarBg = isJisele ? 'var(--primary)' : 'var(--secondary)';
  const borderColor = isJisele ? '#FF1493' : '#9B59B6';

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* En-tête */}
      <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 0px #FFC0CB' }}>
        <div className="container flex items-center justify-between">
          <h1 className="text-gradient" style={{ fontSize: '1.8rem' }}>
            Baddys
          </h1>
          <button onClick={onLogout} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Changer de profil">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{currentUser.name.split(' ')[0]}</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
              background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#fff',
              border: `2px solid ${borderColor}`, boxShadow: `2px 2px 0px ${borderColor}`,
              transition: 'transform 0.2s',
            }}>
              {currentUser.name.charAt(0)}
            </div>
          </button>
        </div>

      </header>

      {/* Zone de contenu */}
      <main className="container flex-col" style={{ flex: 1, padding: '2rem 1rem' }}>
        {children}
      </main>

      {/* Navigation du bas */}
      <nav className="glass-card" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        borderBottom: 0,
        borderLeft: 0,
        borderRight: 0,
        padding: '0.75rem 0',
        zIndex: 100
      }}>
        <div className="container flex justify-between items-center" style={{ maxWidth: '500px' }}>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <Home size={22} />
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Accueil</span>
          </button>

          <button
            onClick={() => setActiveTab('duel')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: activeTab === 'duel' ? 'var(--secondary)' : 'var(--text-muted)'
            }}
          >
            <Swords size={22} />
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Duel</span>
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className="btn-icon"
            style={{
              width: '56px', height: '56px',
              transform: 'translateY(-20px)',
              background: 'var(--primary)',
              color: '#fff',
              border: '2px solid #FF1493',
              boxShadow: '4px 4px 0px #FF1493'
            }}
          >
            <Plus size={32} />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: activeTab === 'profile' ? 'var(--secondary)' : 'var(--text-muted)'
            }}
          >
            <User size={22} />
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

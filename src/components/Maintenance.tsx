import React from 'react';
import { Coffee, Heart } from 'lucide-react';

const Maintenance: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '2rem',
      background: 'var(--bg-main)',
      textAlign: 'center',
    }}>
      <div className="glass-card flex-col items-center gap-6" style={{ padding: '3rem 2rem', maxWidth: '400px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 105, 180, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--primary)',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <Coffee size={40} color="var(--primary)" />
        </div>

        <div className="flex-col gap-2">
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Baddys</h1>
          <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>
            Petite pause café ! ☕️
          </p>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            On fait quelques mises à jour pour rendre l'appli encore plus belle. On revient très vite !
          </p>
        </div>

        <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
          <span>Fait avec</span>
          <Heart size={14} color="var(--primary)" fill="var(--primary)" />
          <span>par Jisele</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;

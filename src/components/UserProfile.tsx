import React from 'react';
import { Award, Target, Settings, ChevronRight, LogOut } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';
import type { AppUser } from '../store/useStore';

interface UserProfileProps {
  currentUser: UserProfileType;
  appUser?: AppUser;
  onLogout: () => void;
  onUpdatePin: (pin: string | undefined) => void;
  onResetHistory: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, appUser, onLogout, onUpdatePin, onResetHistory }) => {
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [newPin, setNewPin] = React.useState('');
  const [pinError, setPinError] = React.useState('');

  const avatarBg = appUser?.color || 'var(--primary)';
  const borderColor = appUser?.borderColor || '#FF1493';
  const history = appUser?.history || [];

  const handleSavePin = () => {
    if (newPin.length > 0 && newPin.length !== 4) {
      setPinError('Le PIN doit faire exactement 4 chiffres.');
      return;
    }
    onUpdatePin(newPin || undefined);
    setShowPinModal(false);
    setNewPin('');
    setPinError('');
  };

  // ... (volume calculation remains same)
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
      {/* PIN Modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card flex-col gap-4" style={{ padding: '2rem', width: '100%', maxWidth: '350px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🔒 Sécuriser mon Profil</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Entre un code à 4 chiffres. Laisse vide pour supprimer la protection.
            </p>
            <input
              type="text"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 1234"
              className="glass-card"
              style={{
                width: '100%', padding: '1rem', textAlign: 'center', fontSize: '1.5rem',
                letterSpacing: '1rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)'
              }}
            />
            {pinError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{pinError}</div>}
            <div className="flex gap-2">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPinModal(false)}>Annuler</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSavePin}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={() => { setNewPin(currentUser.pin || ''); setShowPinModal(true); }} className="flex items-center justify-between" style={{ padding: '1rem', width: '100%', borderBottom: '1px solid var(--border-glass)' }}>
            <span className="flex items-center gap-2">
              🔒 <span>{currentUser.pin ? 'Modifier le code PIN' : 'Ajouter un code PIN'}</span>
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <button onClick={onResetHistory} className="flex items-center justify-between" style={{ padding: '1rem', width: '100%', borderBottom: '1px solid var(--border-glass)' }}>
            <span className="flex items-center gap-2" style={{ color: 'var(--danger)' }}>
              🔥 <span>Réinitialiser mon profil (0)</span>
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <button className="flex items-center justify-between" style={{ padding: '1rem', width: '100%', borderBottom: '1px solid var(--border-glass)' }}>
            <span>Unités de Mesure (kg/cm)</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Métrique</span>
          </button>
          <button onClick={onLogout} className="flex items-center justify-between" style={{ padding: '1rem', width: '100%' }}>
            <span className="flex items-center gap-2" style={{ color: 'var(--danger)' }}>
              <LogOut size={16} /> Déconnexion
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

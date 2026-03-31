import React, { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import type { UserProfile } from '../types';
import type { AppUser } from '../store/useStore';

interface ProfileSelectorProps {
  users: AppUser[];
  onSelect: (profile: UserProfile) => void;
  onAddUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ users, onSelect, onAddUser, onDeleteUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim() === '') return;
    onAddUser(newName.trim());
    setNewName('');
    setShowForm(false);
  };

  const handleDelete = (e: React.MouseEvent, user: AppUser) => {
    e.stopPropagation();
    if (window.confirm(`Es-tu sûr de vouloir supprimer le profil de ${user.profile.name} ? Toutes ses données seront perdues.`)) {
      onDeleteUser(user.profile.id);
    }
  };

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

      <div className="flex gap-6" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
        {users.map((user) => (
          <button
            key={user.profile.id}
            onClick={() => onSelect(user.profile)}
            className="glass-card flex-col items-center gap-3"
            style={{
              padding: '1.5rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '150px',
              position: 'relative',
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(e, user)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.2)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                zIndex: 2,
              }}
              title={`Supprimer ${user.profile.name}`}
            >
              ✕
            </button>
            <div style={{
              width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
              background: user.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: '#fff',
              border: `4px solid ${user.borderColor}`, boxShadow: `4px 4px 0px ${user.borderColor}`,
            }}>
              {user.profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              {user.profile.name}
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
              {user.profile.workoutsCompleted} séances
            </div>
          </button>
        ))}

        {/* Add new user button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="glass-card flex-col items-center justify-center gap-3"
            style={{
              padding: '1.5rem 2rem',
              cursor: 'pointer',
              minWidth: '150px',
              borderStyle: 'dashed',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <div style={{
              width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
              background: 'var(--bg-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px dashed var(--border-glass)',
            }}>
              <UserPlus size={32} color="var(--text-muted)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-muted)' }}>
              Ajouter
            </div>
          </button>
        )}
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="glass-card flex-col gap-4" style={{ padding: '1.5rem', width: '100%', maxWidth: '350px' }}>
          <div className="flex items-center gap-2">
            <UserPlus size={20} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Nouveau Profil</span>
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Prénom..."
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            style={{
              width: '100%', padding: '0.8rem',
              background: 'rgba(255, 192, 203, 0.15)',
              border: '2px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-main)', fontSize: '1rem',
              outline: 'none',
            }}
          />
          <div className="flex gap-2">
            <button
              className="btn-secondary flex justify-center items-center gap-2"
              onClick={() => { setShowForm(false); setNewName(''); }}
              style={{ flex: 1, padding: '0.6rem' }}
            >
              Annuler
            </button>
            <button
              className="btn-primary flex justify-center items-center gap-2"
              onClick={handleAdd}
              style={{ flex: 1, padding: '0.6rem', opacity: newName.trim() === '' ? 0.5 : 1 }}
            >
              <Plus size={16} /> Créer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;

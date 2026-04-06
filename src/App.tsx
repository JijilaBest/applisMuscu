import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import UserProfile from './components/UserProfile';
import Duel from './components/Duel';
import ProfileSelector from './components/ProfileSelector';
import Maintenance from './components/Maintenance';
import type { UserProfile as UserProfileType } from './types';
import { useAppStore } from './store/useStore';

//  Mode Maintenance : Mettre à true pour fermer le site temporairement
const MAINTENANCE_MODE = false;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfileType | null>(null);
  const store = useAppStore();

  // Auto-login from store's activeUserId
  useEffect(() => {
    if (store.activeUserId && !currentUser) {
      const user = store.getUserById(store.activeUserId);
      if (user) {
        setCurrentUser(user.profile);
      } else {
        store.setActiveUserId(null);
      }
    }
  }, [store.activeUserId, store.users]);

  if (MAINTENANCE_MODE) {
    return <Maintenance />;
  }

  if (!currentUser) {
    return (
      <ProfileSelector
        users={store.users}
        onSelect={(profile) => {
          if (!profile.pin) {
            store.setActiveUserId(profile.id);
            setCurrentUser(profile);
          }
          // If profile has PIN, ProfileSelector will handle the UI and then call onSelect 
          // but we might need to change how onSelect works to handle PIN verification.
          // For now, let's assume we pass the profile and ProfileSelector handles PIN.
        }}
        onConfirmPin={(profile) => {
          store.setActiveUserId(profile.id);
          setCurrentUser(profile);
        }}
        onAddUser={(name) => {
          const newUser = store.addUser(name);
          setCurrentUser(newUser.profile);
        }}
        onDeleteUser={(id) => store.removeUser(id)}
      />
    );
  }

  const appUser = store.getUserByProfile(currentUser);

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser} 
      onLogout={() => {
        store.logout();
        setCurrentUser(null);
      }}
    >
      {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} appUser={appUser} />}
      {activeTab === 'workout' && <WorkoutLogger currentUser={currentUser} appUser={appUser} onSaveWorkout={(s: any) => store.addWorkout(currentUser.id, s)} />}
      {activeTab === 'profile' && (
        <UserProfile 
          currentUser={currentUser} 
          appUser={appUser} 
          onLogout={() => { store.logout(); setCurrentUser(null); }} 
          onUpdatePin={(pin) => store.updateUserPin(currentUser.id, pin)} 
          onResetHistory={() => store.resetUserHistory(currentUser.id)}
        />
      )}
      {activeTab === 'duel' && <Duel currentUser={currentUser} allUsers={store.users} />}
    </Layout>
  );
}

export default App;

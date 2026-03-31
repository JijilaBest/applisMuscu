import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import UserProfile from './components/UserProfile';
import Duel from './components/Duel';
import ProfileSelector from './components/ProfileSelector';
import type { UserProfile as UserProfileType } from './types';
import { useAppStore } from './store/useStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfileType | null>(null);
  const store = useAppStore();

  if (!currentUser) {
    return (
      <ProfileSelector
        users={store.users}
        onSelect={(profile) => setCurrentUser(profile)}
        onAddUser={(name) => {
          const newUser = store.addUser(name);
          setCurrentUser(newUser.profile);
        }}
      />
    );
  }

  const appUser = store.getUserByProfile(currentUser);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentUser(null)}>
      {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} appUser={appUser} />}
      {activeTab === 'workout' && <WorkoutLogger />}
      {activeTab === 'profile' && <UserProfile currentUser={currentUser} appUser={appUser} onLogout={() => setCurrentUser(null)} />}
      {activeTab === 'duel' && <Duel currentUser={currentUser} allUsers={store.users} />}
    </Layout>
  );
}

export default App;

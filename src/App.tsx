import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import UserProfile from './components/UserProfile';
import Duel from './components/Duel';
import ProfileSelector from './components/ProfileSelector';
import type { UserProfile as UserProfileType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfileType | null>(null);

  if (!currentUser) {
    return <ProfileSelector onSelect={(profile) => setCurrentUser(profile)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentUser(null)}>
      {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} />}
      {activeTab === 'workout' && <WorkoutLogger />}
      {activeTab === 'profile' && <UserProfile currentUser={currentUser} onLogout={() => setCurrentUser(null)} />}
      {activeTab === 'duel' && <Duel currentUser={currentUser} />}
    </Layout>
  );
}

export default App;

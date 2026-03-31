import { useState, useEffect } from 'react';
import type { UserProfile, WorkoutSession } from '../types';
import { mockUser, mockHistory, mockRonan, ronanHistory, mockExercises } from './mockData';

export type AppUser = {
  profile: UserProfile;
  history: WorkoutSession[];
  color: string;       // avatar color
  borderColor: string; // border/shadow color
};

const COLORS = [
  { bg: '#FF69B4', border: '#FF1493' },  // Pink
  { bg: '#9B59B6', border: '#7D3C98' },  // Purple
  { bg: '#3498DB', border: '#2471A3' },  // Blue
  { bg: '#2ECC71', border: '#27AE60' },  // Green
  { bg: '#E67E22', border: '#D35400' },  // Orange
  { bg: '#1ABC9C', border: '#16A085' },  // Teal
  { bg: '#E74C3C', border: '#C0392B' },  // Red
  { bg: '#F39C12', border: '#D4AC0D' },  // Yellow
];

const STORAGE_KEY = 'baddys-users';

const defaultUsers: AppUser[] = [
  {
    profile: mockUser,
    history: mockHistory,
    color: COLORS[0].bg,
    borderColor: COLORS[0].border,
  },
  {
    profile: mockRonan,
    history: ronanHistory,
    color: COLORS[1].bg,
    borderColor: COLORS[1].border,
  },
];

function loadUsers(): AppUser[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return defaultUsers;
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function useAppStore() {
  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const addUser = (name: string) => {
    const colorIdx = users.length % COLORS.length;
    const newUser: AppUser = {
      profile: {
        id: `user-${Date.now()}`,
        name,
        workoutsCompleted: 0,
        joinedDate: new Date().toISOString().substring(0, 10),
      },
      history: [],
      color: COLORS[colorIdx].bg,
      borderColor: COLORS[colorIdx].border,
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(u => u.profile.id !== userId));
  };

  const getUserByProfile = (profile: UserProfile): AppUser | undefined => {
    return users.find(u => u.profile.id === profile.id);
  };

  const getOtherUsers = (currentId: string): AppUser[] => {
    return users.filter(u => u.profile.id !== currentId);
  };

  return {
    users,
    addUser,
    removeUser,
    getUserByProfile,
    getOtherUsers,
  };
}

export { mockExercises };

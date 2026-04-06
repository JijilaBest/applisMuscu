import { useState, useEffect } from 'react';
import type { UserProfile, WorkoutSession } from '../types';
import { supabase } from '../lib/supabase';
import { mockExercises } from './mockData';

export type AppUser = {
  profile: UserProfile;
  history: WorkoutSession[];
  color: string;
  borderColor: string;
};

const COLORS = [
  { bg: '#FF69B4', border: '#FF1493' },
  { bg: '#9B59B6', border: '#7D3C98' },
  { bg: '#3498DB', border: '#2471A3' },
  { bg: '#2ECC71', border: '#27AE60' },
  { bg: '#E67E22', border: '#D35400' },
  { bg: '#1ABC9C', border: '#16A085' },
  { bg: '#E74C3C', border: '#C0392B' },
  { bg: '#F39C12', border: '#D4AC0D' },
];

const CURRENT_USER_KEY = 'baddys-current-user-id';

export function useAppStore() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(() => localStorage.getItem(CURRENT_USER_KEY));

  // Sync activeUserId to localStorage
  useEffect(() => {
    if (activeUserId) localStorage.setItem(CURRENT_USER_KEY, activeUserId);
    else localStorage.removeItem(CURRENT_USER_KEY);
  }, [activeUserId]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    const fetchData = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: workouts } = await supabase.from('workouts').select('*').order('date', { ascending: false });

      if (profiles) {
        const mappedUsers: AppUser[] = profiles.map(p => ({
          profile: {
            id: p.id,
            name: p.name,
            pin: p.pin,
            workoutsCompleted: p.workouts_completed,
            joinedDate: p.joined_date,
          },
          history: workouts?.filter(w => w.profile_id === p.id).map(w => ({
            id: w.id,
            name: w.name,
            date: w.date,
            durationMinutes: w.duration_minutes,
            caloriesEstimate: w.calories_estimate,
            exercises: w.exercises,
          })) || [],
          color: p.color || COLORS[0].bg,
          borderColor: p.border_color || COLORS[0].border,
        }));
        setUsers(mappedUsers);
      }
    };

    fetchData();

    // Subscribe to Realtime changes
    const profilesSub = supabase.channel('profiles-changes').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'profiles' }, 
      () => fetchData()
    ).subscribe();

    const workoutsSub = supabase.channel('workouts-changes').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'workouts' }, 
      () => fetchData()
    ).subscribe();

    return () => {
      supabase.removeChannel(profilesSub);
      supabase.removeChannel(workoutsSub);
    };
  }, []);

  const addUser = async (name: string) => {
    const colorIdx = users.length % COLORS.length;
    const { data, error } = await supabase.from('profiles').insert([{
      name,
      workouts_completed: 0,
      joined_date: new Date().toISOString().substring(0, 10),
      color: COLORS[colorIdx].bg,
      border_color: COLORS[colorIdx].border,
    }]).select().single();

    if (data && !error) {
      const newUser: AppUser = {
        profile: { id: data.id, name, workoutsCompleted: 0, joinedDate: data.joined_date },
        history: [],
        color: data.color,
        borderColor: data.border_color,
      };
      setActiveUserId(data.id);
      return newUser;
    }
  };

  const removeUser = async (userId: string) => {
    await supabase.from('profiles').delete().eq('id', userId);
    if (activeUserId === userId) setActiveUserId(null);
  };

  const updateUserPin = async (userId: string, pin: string | undefined) => {
    await supabase.from('profiles').update({ pin }).eq('id', userId);
  };

  const logout = () => {
    setActiveUserId(null);
  };

  const getUserByProfile = (profile: UserProfile): AppUser | undefined => {
    return users.find(u => u.profile.id === profile.id);
  };

  const getUserById = (id: string): AppUser | undefined => {
    return users.find(u => u.profile.id === id);
  };

  const getOtherUsers = (currentId: string): AppUser[] => {
    return users.filter(u => u.profile.id !== currentId);
  };

  const addWorkout = async (userId: string, session: WorkoutSession) => {
    // 1. Insert workout
    await supabase.from('workouts').insert([{
      profile_id: userId,
      name: session.name,
      date: session.date,
      duration_minutes: session.durationMinutes,
      calories_estimate: session.caloriesEstimate,
      exercises: session.exercises,
    }]);

    // 2. Increment completed count
    const user = users.find(u => u.profile.id === userId);
    if (user) {
      await supabase.from('profiles')
        .update({ workouts_completed: user.profile.workoutsCompleted + 1 })
        .eq('id', userId);
    }
  };

  const resetUserHistory = async (userId: string) => {
    if (window.confirm("Es-tu sûr(e) de vouloir réinitialiser ton profil ? Toutes tes séances seront effacées.")) {
      await supabase.from('workouts').delete().eq('profile_id', userId);
      await supabase.from('profiles').update({ workouts_completed: 0 }).eq('id', userId);
    }
  };

  return {
    users,
    activeUserId,
    setActiveUserId,
    addUser,
    removeUser,
    updateUserPin,
    resetUserHistory,
    logout,
    getUserByProfile,
    getUserById,
    getOtherUsers,
    addWorkout,
  };
}

export { mockExercises };

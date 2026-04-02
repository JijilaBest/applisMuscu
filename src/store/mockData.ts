import type { UserProfile, WorkoutSession, Exercise } from '../types';

export const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Jisele Fitness',
  workoutsCompleted: 42,
  joinedDate: '2025-01-15'
};

export const mockExercises: Exercise[] = [
  // Haut du Corps
  { id: '1', name: 'Développé Couché', muscle: 'Pectoraux', category: 'Haut du Corps' },
  { id: '2', name: 'Développé Incliné Haltères', muscle: 'Pectoraux', category: 'Haut du Corps' },
  { id: '3', name: 'Tractions', muscle: 'Dos', category: 'Haut du Corps' },
  { id: '4', name: 'Rowing Barre', muscle: 'Dos', category: 'Haut du Corps' },
  { id: '5', name: 'Développé Militaire', muscle: 'Épaules', category: 'Haut du Corps' },
  { id: '6', name: 'Élévations Latérales', muscle: 'Épaules', category: 'Haut du Corps' },
  { id: '7', name: 'Curl Barre', muscle: 'Biceps', category: 'Haut du Corps' },
  { id: '8', name: 'Extensions Triceps', muscle: 'Triceps', category: 'Haut du Corps' },
  // Bas du Corps
  { id: '9', name: 'Squats', muscle: 'Quadriceps', category: 'Bas du Corps' },
  { id: '10', name: 'Presse à Cuisses', muscle: 'Quadriceps', category: 'Bas du Corps' },
  { id: '11', name: 'Soulevé de Terre Roumain', muscle: 'Ischio-jambiers', category: 'Bas du Corps' },
  { id: '12', name: 'Leg Curl', muscle: 'Ischio-jambiers', category: 'Bas du Corps' },
  { id: '13', name: 'Mollets Debout', muscle: 'Mollets', category: 'Bas du Corps' },
  { id: '14', name: 'Hip Thrust', muscle: 'Fessiers', category: 'Bas du Corps' },
  // Cardio
  { id: '15', name: 'Tapis de Course', muscle: 'Tapis', category: 'Cardio' },
  { id: '16', name: 'Vélo Stationnaire', muscle: 'Vélo', category: 'Cardio' },
  { id: '17', name: 'Rameur', muscle: 'Rameur', category: 'Cardio' },
  { id: '18', name: 'Elliptique', muscle: 'Elliptique', category: 'Cardio' },
  { id: '19', name: 'Escaliers', muscle: 'Escaliers', category: 'Cardio' },
];

export const mockHistory: WorkoutSession[] = [
  {
    id: 'session-1',
    date: '2026-03-10',
    name: 'Force Haut du Corps',
    durationMinutes: 65,
    exercises: [
      {
        id: 'we-1',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 's1', reps: 8, weight: 70, completed: true },
          { id: 's2', reps: 8, weight: 70, completed: true },
          { id: 's3', reps: 6, weight: 75, completed: true }
        ]
      }
    ]
  },
  {
    id: 'session-2',
    date: '2026-03-14',
    name: 'Jour Jambes',
    durationMinutes: 50,
    exercises: [
      {
        id: 'we-2',
        exercise: mockExercises[8],
        validated: true,
        sets: [
          { id: 's4', reps: 10, weight: 90, completed: true },
          { id: 's5', reps: 10, weight: 90, completed: true },
          { id: 's6', reps: 8, weight: 95, completed: true }
        ]
      }
    ]
  },
  {
    id: 'session-3',
    date: '2026-03-18',
    name: 'Push Day',
    durationMinutes: 55,
    exercises: [
      {
        id: 'we-3',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 's7', reps: 8, weight: 75, completed: true },
          { id: 's8', reps: 8, weight: 80, completed: true },
          { id: 's9', reps: 6, weight: 80, completed: true }
        ]
      }
    ]
  },
  {
    id: 'session-4',
    date: '2026-03-24',
    name: 'Force Haut du Corps',
    durationMinutes: 60,
    exercises: [
      {
        id: 'we-4',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 's10', reps: 8, weight: 80, completed: true },
          { id: 's11', reps: 8, weight: 80, completed: true },
          { id: 's12', reps: 6, weight: 85, completed: true }
        ]
      }
    ]
  },
  {
    id: 'session-5',
    date: '2026-03-28',
    name: 'Full Body',
    durationMinutes: 70,
    exercises: [
      {
        id: 'we-5',
        exercise: mockExercises[8],
        validated: true,
        sets: [
          { id: 's13', reps: 10, weight: 100, completed: true },
          { id: 's14', reps: 10, weight: 100, completed: true },
          { id: 's15', reps: 8, weight: 110, completed: true }
        ]
      }
    ]
  },
  {
    id: 'session-6',
    date: '2026-03-31',
    name: 'Cardio Brûle-Graisse',
    durationMinutes: 45,
    caloriesEstimate: 450,
    exercises: [
      {
        id: 'we-6',
        exercise: mockExercises[14], // Tapis
        validated: true,
        sets: [
          { id: 'cs1', reps: 30, weight: 8, completed: true },
        ]
      }
    ]
  }
];

export const mockBaddie: UserProfile = {
  id: 'user-3',
  name: 'Baddie',
  workoutsCompleted: 55,
  joinedDate: '2025-01-01'
};

export const baddieHistory: WorkoutSession[] = [
  {
    id: 'b-session-1',
    date: '2026-03-20',
    name: 'Cardio Queen',
    durationMinutes: 60,
    caloriesEstimate: 600,
    exercises: [
      {
        id: 'bwe-1',
        exercise: mockExercises[14],
        validated: true,
        sets: [{ id: 'bs1', reps: 60, weight: 10, completed: true }]
      }
    ]
  },
  {
    id: 'b-session-2',
    date: '2026-03-25',
    name: 'Full Body Burn',
    durationMinutes: 75,
    caloriesEstimate: 750,
    exercises: [
      {
        id: 'bwe-2',
        exercise: mockExercises[16],
        validated: true,
        sets: [{ id: 'bs2', reps: 45, weight: 12, completed: true }]
      }
    ]
  }
];

// --- Ronan (2ème profil pour le Duel) ---
export const mockRonan: UserProfile = {
  id: 'user-2',
  name: 'Ronan',
  workoutsCompleted: 38,
  joinedDate: '2025-02-01'
};

export const ronanHistory: WorkoutSession[] = [
  {
    id: 'r-session-1',
    date: '2026-03-10',
    name: 'Push',
    durationMinutes: 50,
    exercises: [
      {
        id: 'rwe-1',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 'rs1', reps: 10, weight: 60, completed: true },
          { id: 'rs2', reps: 10, weight: 60, completed: true },
          { id: 'rs3', reps: 8, weight: 65, completed: true }
        ]
      }
    ]
  },
  {
    id: 'r-session-2',
    date: '2026-03-14',
    name: 'Jambes',
    durationMinutes: 45,
    exercises: [
      {
        id: 'rwe-2',
        exercise: mockExercises[8],
        validated: true,
        sets: [
          { id: 'rs4', reps: 12, weight: 70, completed: true },
          { id: 'rs5', reps: 12, weight: 70, completed: true },
          { id: 'rs6', reps: 10, weight: 75, completed: true }
        ]
      }
    ]
  },
  {
    id: 'r-session-3',
    date: '2026-03-18',
    name: 'Haut du Corps',
    durationMinutes: 55,
    exercises: [
      {
        id: 'rwe-3',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 'rs7', reps: 10, weight: 65, completed: true },
          { id: 'rs8', reps: 10, weight: 65, completed: true },
          { id: 'rs9', reps: 8, weight: 70, completed: true }
        ]
      }
    ]
  },
  {
    id: 'r-session-4',
    date: '2026-03-24',
    name: 'Push Power',
    durationMinutes: 60,
    exercises: [
      {
        id: 'rwe-4',
        exercise: mockExercises[0],
        validated: true,
        sets: [
          { id: 'rs10', reps: 10, weight: 70, completed: true },
          { id: 'rs11', reps: 10, weight: 70, completed: true },
          { id: 'rs12', reps: 8, weight: 75, completed: true }
        ]
      }
    ]
  },
  {
    id: 'r-session-5',
    date: '2026-03-28',
    name: 'Full Body',
    durationMinutes: 65,
    exercises: [
      {
        id: 'rwe-5',
        exercise: mockExercises[8],
        validated: true,
        sets: [
          { id: 'rs13', reps: 12, weight: 80, completed: true },
          { id: 'rs14', reps: 12, weight: 80, completed: true },
          { id: 'rs15', reps: 10, weight: 85, completed: true }
        ]
      }
    ]
  }
];

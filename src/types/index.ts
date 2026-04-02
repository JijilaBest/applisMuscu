export type MuscleCategory = 'Haut du Corps' | 'Bas du Corps' | 'Cardio';

export type Muscle = 
  | 'Pectoraux' 
  | 'Dos' 
  | 'Épaules' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Abdos' 
  | 'Quadriceps' 
  | 'Ischio-jambiers' 
  | 'Fessiers' 
  | 'Mollets'
  | 'Cœur'
  | 'Tout le corps'
  | 'Tapis'
  | 'Vélo'
  | 'Rameur'
  | 'Elliptique'
  | 'Escaliers';

export type Exercise = {
  id: string;
  name: string;
  muscle: Muscle;
  category: MuscleCategory;
};

export type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  calories?: number;
  validated: boolean;
};

export type WorkoutSession = {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  caloriesEstimate?: number;
};

export type UserProfile = {
  id: string;
  name: string;
  workoutsCompleted: number;
  joinedDate: string;
};

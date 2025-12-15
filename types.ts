export enum UserLevel {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado'
}

export enum GoalType {
  FIVE_K = '5K',
  TEN_K = '10K',
  HALF_MARATHON = 'Media Maratón',
  MARATHON = 'Maratón',
  FITNESS = 'Mantenimiento'
}

export interface UserProfile {
  name: string;
  age: number;
  level: UserLevel;
  goal: GoalType;
  daysPerWeek: number;
  currentWeeklyDistance: number; // km
  notes: string;
}

export enum WorkoutType {
  REST = 'Descanso',
  EASY_RUN = 'Rodaje Suave',
  TEMPO = 'Tempo / Ritmo',
  INTERVALS = 'Intervalos / Series',
  LONG_RUN = 'Tirada Larga',
  RECOVERY = 'Recuperación',
  STRENGTH = 'Fuerza'
}

export interface Workout {
  id: string;
  dayName: string; // e.g., "Lunes"
  type: WorkoutType;
  distanceKm: number;
  durationMinutes: number;
  description: string;
  paceTarget?: string; // e.g., "5:30 min/km"
  completed: boolean;
  actualDistance?: number;
  actualDuration?: number;
  feedback?: string; // User feedback after run
  feeling?: number; // 1-10
}

export interface WeekPlan {
  weekNumber: number;
  focus: string; // e.g., "Base Building"
  workouts: Workout[];
  totalDistance: number;
}

export interface TrainingPlan {
  id: string;
  createdAt: string;
  goal: string;
  weeks: WeekPlan[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
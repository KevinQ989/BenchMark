export interface Set {
    reps: number;
    weight: number;
}

export interface Exercise {
    exerciseName: string;
    sets: Set[];
}

export interface ExerciseParams {
    exerciseName: string;
    sets: string;
}

export interface Routine {
    id: string;
    routineName: string;
    description: string;
    exercises: Exercise[];
}
  
export interface RoutineParams {
  id: string;
  routineName: string;
  description: string;
  exercises: string;
}

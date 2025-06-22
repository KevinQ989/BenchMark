export interface Set {
    reps: number;
    weight: number;
}

export interface Exercise {
    exerciseName: string;
    sets: Set[];
}

export interface ExerciseInfo {
    exerciseName: string;
    target: string;
    subTarget: string;
    equipment: string;
}

export interface ExerciseParams {
    exerciseName: string;
    sets: string;
}

//For uploading and downloading from firestore
export interface Routine {
    id: string;
    routineName: string;
    description: string;
    exercises: Exercise[];
}
  
//For passing routine information between screens
export interface RoutineParams {
  id: string;
  routineName: string;
  description: string;
  exercises: string;
  started: string;
}

//For workout history
export interface WorkoutRecord {
    id: string;
    routineName: string;
    description: string;
    exercises: Exercise[];
    date: Date;
    duration: number;
}

export interface Metric {
    metric: string;
    value: string;
}
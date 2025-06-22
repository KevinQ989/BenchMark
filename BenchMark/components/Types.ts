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
}

//For friends functionality
export interface Friend {
    id: string;
    uid: string;
    username: string;
    email: string;
    lastMessage?: string;
    lastMessageTime?: Date;
}

export interface FriendRequest {
    id: string;
    fromUid: string;
    fromUsername: string;
    fromEmail: string;
    toUid: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: Date;
}

export interface ChatMessage {
    id: string;
    senderUid: string;
    senderUsername: string;
    message: string;
    timestamp: Date;
}

export interface Chat {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: Date;
}
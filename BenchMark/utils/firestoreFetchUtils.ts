import {
    getFirestore,
    getDocs,
    query,
    collection,
    getDoc,
    doc
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Exercise, ExerciseInfo, RepMax, Routine, Set, UserData, WorkoutRecord } from "@/constants/Types";
import { FirebaseError } from "firebase/app";
import { Alert } from "react-native";

const db = getFirestore();

export const fetchExercises = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "exercises")));
        const exercises = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                exerciseName: data.exerciseName,
                target: data.target,
                subTarget: data.subTarget,
                equipment: data.equipment 
            } as ExerciseInfo;
        });
        return exercises;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Exercises Failed", err.message);
    }
};

export const fetchRoutines = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const querySnapshot = await getDocs(
            query(collection(db, "users", uid, "myRoutines"))
        );
        const routines = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const exercises = data.exercises.map((exercise: any) => {
                const sets: Set[] = exercise.sets.map((set: any, setIndex: number) => ({
                    setNum: setIndex + 1,
                    weight: set.weight,
                    reps: set.reps,
                }));

                return {
                    exerciseName: exercise.exerciseName,
                    sets: sets,
                } as Exercise;
            });

            return {
                id: doc.id,
                routineName: data.routineName,
                description: data.description,
                exercises: exercises,
            } as Routine;
        });
        return routines;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Routines Failed", err.message);
    }
};

export const fetchUserData = async (uid: string) => {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        const data = docSnap.data();
        return {
            username: data?.username,
            photoURL: data?.photoURL,
            workouts: data?.metrics.workouts ?? 0,
            duration: data?.metrics.duration ?? 0,
            goal: data?.metrics.goal ?? 0
        } as UserData;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert(`Fetch User ${uid} Data Failed`, err.message);
    }
};

export const fetchRecords = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        
        const querySnapshot = await getDocs(collection(db, "users", uid, "repmax"))
        const repmaxs: RepMax[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                exercise: data.exercise,
                history: data.history.map((record: any) => ({
                    date: record.date.toDate(),
                    weight: record.weight
                }))
            };
        });
        return repmaxs;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Records Failed", err.message);
    }
};

export const fetchHistory = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const querySnapshot = await getDocs(collection(db, "users", uid, "myWorkouts"));
        const history = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const exercises = data.exercises.map(
                (exercise: any, exerciseIndex: number) => {
                    const sets = exercise.sets.map((set: any, setIndex: number) => ({
                        setNum: setIndex + 1,
                        weight: set.weight,
                        reps: set.reps,
                    }));

                    return {
                        exerciseName: exercise.exerciseName,
                        sets: sets,
                    } as Exercise;
                }
            );

            return {
                id: doc.id,
                routineName: data.routineName,
                description: data.description,
                exercises: exercises,
                date: data.date.toDate()
            } as WorkoutRecord;
        });
        return history;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch History Failed:", err.message);
    }
};
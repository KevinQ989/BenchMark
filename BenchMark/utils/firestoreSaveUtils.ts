import {
    getFirestore,
    addDoc,
    collection,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    arrayUnion
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Exercise } from "@/constants/Types";

const db = getFirestore();
const router = useRouter();

export const addExercise = async (
    exerciseName: string,
    target: string,
    subTarget: string | null,
    equipment: string
) => {
    try {
        await addDoc(collection(db, "exercises"), {
            exerciseName: exerciseName,
            target: target,
            subTarget: subTarget,
            equipment: equipment
        });
        Alert.alert("Success", "Exercise Added Succesfully");
        return true;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Add Exercise Failed", err.message);
        return false;
    }
};

export const addRoutine = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const newRoutine = {
            routineName: "New Routine",
            description: "-",
            exercises: [],
        };
        const docRef = await addDoc(
            collection(db, "users", uid, "myRoutines"),
            newRoutine
        );
        router.push({
            pathname: "/home/routine",
            params: {
                id: docRef.id,
                routineName: newRoutine.routineName,
                description: newRoutine.description,
                exercises: JSON.stringify(newRoutine.exercises),
                started: "false",
            },
        });
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Add Routine Failed", err.message);
    }
};

export const saveRoutine = async (
    id: string,
    routineName: string,
    description: string,
    inputs: {[key: string]: {weight: string; reps: string}},
    exercises: Exercise[]
) => {
    try {
		const uid = auth().currentUser?.uid;
        if (!uid) return;

		const updatedExercises = exercises.map((exercise, exerciseIndex) => ({
			...exercise,
			sets: exercise.sets.map((set, setIndex) => {
			const key = `${exerciseIndex}-${setIndex}`;
			const inputValue = inputs[key] || {};
			return {
				weight: inputValue.weight ? Number(inputValue.weight) : set.weight,
				reps: inputValue.reps ? Number(inputValue.reps) : set.reps,
			};
			}),
		}));

		await setDoc(
			doc(db, "users", uid, "myRoutines", id),
			{
                routineName: routineName,
                description: description,
                exercises: updatedExercises,
			}
		);
		router.replace("/(tabs)/home");
    } catch (e: any) {
        const err = e as FirebaseError;
        alert("Save Routine Failed: " + err.message);
    }
};

export const deleteRoutine = async (id: string) => {
    try {
		const uid = auth().currentUser?.uid;
        if (!uid) return;

		await deleteDoc(doc(db, "users", uid, "myRoutines", id));
		Alert.alert("Success", "Routine deleted successfully");
		router.replace("/(tabs)/home");
    } catch (e) {
        const err = e as FirebaseError;
        Alert.alert("Delete Routine Failed", err.message);
    }
};

export const endWorkout = async (
    routineName: string,
    description: string,
    inputs: {[key: string]: {weight: string; reps: string}},
    exercises: Exercise[],
    timer: number
) => {
    try {
		const uid = auth().currentUser?.uid;
        if (!uid) return;

		const updatedExercises = exercises.map((exercise, exerciseIndex) => ({
			...exercise,
			sets: exercise.sets.map((set, setIndex) => {
			const key = `${exerciseIndex}-${setIndex}`;
			const inputValue = inputs[key] || {};
			return {
				weight: inputValue.weight ? Number(inputValue.weight) : set.weight,
				reps: inputValue.reps ? Number(inputValue.reps) : set.reps,
			};
			}),
		}));

		await addDoc(collection(db, "users", uid, "myWorkouts"), {
			routineName: routineName,
			description: description,
			exercises: updatedExercises,
			date: new Date(),
			duration: timer,
		});
        
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                "metrics.workouts": increment(1),
                "metrics.duration": increment(timer)
            });
        } else {
            await setDoc(docRef, {
                metrics: {
                    workouts: 1,
                    duration: timer
                }
            }, {merge: true})
        }

		router.replace("/(tabs)/home");
    } catch (e: any) {
        const err = e as FirebaseError;
        alert("End Workout Failed: " + err.message);
    }
};

export const saveRecord = async (
    exerciseName: string,
    date: Date,
    weight: number
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, "users", uid, "repmax", exerciseName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                history: arrayUnion({
                    date: date,
                    weight: weight
                })
            });
        } else {
            await setDoc(docRef, {
                exercise: exerciseName,
                history: [{
                    date: date,
                    weight: weight
                }]
            });
        }
        Alert.alert("Success", `1RM added for ${exerciseName}`)
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Add 1RM Failed", err.message);
    }
};

export const saveGoal = async (
    goal: number
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, "users", uid);
        await updateDoc(docRef, {
            ["metrics.goal"]: Math.min(Math.max(0, goal), 7)
        });
        Alert.alert("Success", `Weekly workout goal set at ${goal}`);
    }  catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Set Goal Failed", err.message);
    }
}

export const saveUserData = async (
    username: string,
    photoURL: string | null
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        await updateDoc(doc(db, "users", uid), {
            username: username,
            photoURL: photoURL ?? null
        });
        Alert.alert("Success", "Profile Updated");
        router.replace("/profile");
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Save Profile Failed", err.message);
    }
};
import {
    getFirestore,
    getDocs,
    query,
    collection,
    getDoc,
    doc,
    where
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Exercise, ExerciseInfo, Friend, FriendRequest, RepMax, Routine, SearchResult, Set, UserData, WorkoutRecord } from "@/constants/Types";
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

        let workouts = 0;
        let duration = 0;
        let goal = 0;
        if (data?.metrics?.workouts) workouts = data?.metrics.workouts;
        if (data?.metrics?.duration) duration = data?.metrics.duration;
        if (data?.metrics?.goal) goal = data?.metrics.goal;

        return {
            username: data?.username,
            photoURL: data?.photoURL,
            workouts: workouts,
            duration: duration,
            goal: goal
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
        Alert.alert("Fetch History Failed", err.message);
    }
};

export const fetchUsers = async (
    search: string
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        // Search by email
        const emailQuery = query(
            collection(db, "users"),
            where("email", "==", search.toLowerCase())
        );
        const emailSnapshot = await getDocs(emailQuery);

        // Search by username
        const usernameQuery = query(
            collection(db, "users"),
            where("username", "==", search)
        );
        const usernameSnapshot = await getDocs(usernameQuery);

        const results: SearchResult[] = [];

        // Combine results from both queries
        emailSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (doc.id !== uid) {
            results.push({
                uid: doc.id,
                username: data.username,
                email: data.email,
            });
            }
        });
        usernameSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (
                doc.id !== uid &&
                !results.find((r) => r.uid === doc.id)
            ) {
                results.push({
                    uid: doc.id,
                    username: data.username,
                    email: data.email,
                });
            }
        });

        return results;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Users Failed", err.message);
    }
};

export const fetchFriendRequests = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const requestsQuery = query(
            collection(db, "friendRequests"),
            where("toUid", "==", uid),
            where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(requestsQuery);

        const requestsList: FriendRequest[] = requestsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                fromUid: data.fromUid,
                fromUsername: data.fromUsername,
                fromEmail: data.fromEmail,
                toUid: data.toUid,
                status: data.status,
                timestamp: data.timestamp.toDate(),
            } as FriendRequest;
        });

        return requestsList;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Requests Failed", err.message);
    }
};

export const fetchFriends = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
  
        // Get user's friends
        const friendsQuery = query(
            collection(db, "users", uid, "friends")
        );
        const friendsSnapshot = await getDocs(friendsQuery);
  
        const friendsList: Friend[] = [];
  
        for (const friendDoc of friendsSnapshot.docs) {
            const friendData = friendDoc.data();
    
            // Get the chat between current user and this friend
            const chatId = [uid, friendData.uid].sort().join("_");
            const chatDoc = await getDoc(doc(db, "chats", chatId));
    
            let lastMessage = "";
            let lastMessageTime: Date | undefined;
    
            if (chatDoc.exists()) {
                const chatData = chatDoc.data();
                lastMessage = chatData?.lastMessage || "";
                lastMessageTime = chatData?.lastMessageTime?.toDate();
            }
    
            friendsList.push({
                id: friendDoc.id,
                uid: friendData.uid,
                username: friendData.username,
                email: friendData.email,
                lastMessage,
                lastMessageTime,
            });
        }
  
        // Sort friends by last message time (most recent first)
        friendsList.sort((a, b) => {
            if (!a.lastMessageTime && !b.lastMessageTime) return 0;
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        });
  
        return friendsList;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Friends Failed", err.message);
    }
};

export const fetchLeaderboardData = async () => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        const leaderboardData: UserData[] = [];

        const userData: UserData = await fetchUserData(uid);
        leaderboardData.push(userData);

        // Get user's friends
        const friendsQuery = query(
            collection(db, "users", uid, "friends")
        );
        const friendsSnapshot = await getDocs(friendsQuery);
  
        for (const friendDoc of friendsSnapshot.docs) {
            const friendUserData: UserData = await fetchUserData(friendDoc.data().uid);
            leaderboardData.push(friendUserData);
        }

        return leaderboardData;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Fetch Friend Metrics Failed", err.message);
    }
};
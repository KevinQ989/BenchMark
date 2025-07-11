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
    arrayUnion,
    where,
    query,
    getDocs
} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Exercise, Friend, FriendRequest } from "@/constants/Types";

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

export const sendFriendRequest = async (
    targetUid: string,
    targetUsername: string
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        // Get current user's data
		const currentUserDoc = await getDoc(doc(db, "users", uid));
		const currentUserData = currentUserDoc.data();

		// Check if friend request already exists
		const existingRequestQuery = query(
			collection(db, "friendRequests"),
			where("fromUid", "==", uid),
			where("toUid", "==", targetUid),
			where("status", "==", "pending")
		);
		const existingRequestSnapshot = await getDocs(existingRequestQuery);

		if (!existingRequestSnapshot.empty) {
			Alert.alert("Error", "Friend request already sent");
			return;
		}

		// Send friend request
		await addDoc(collection(db, "friendRequests"), {
			fromUid: uid,
			fromUsername: currentUserData?.username,
			fromEmail: currentUserData?.email,
			toUid: targetUid,
			status: "pending",
			timestamp: new Date(),
		});

		Alert.alert("Success", `Friend request sent to ${targetUsername}`);
        return true;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Send Friend Request Failed", err.message);
        return false;
    }
};

export const acceptFriendRequest = async (
    request: FriendRequest
) => {
    try {
		const uid = auth().currentUser?.uid;
		if (!uid) return;

		// Update the friend request status
		await updateDoc(doc(db, "friendRequests", request.id), {
			status: "accepted",
		});

		// Add to friends collection for both users
		const currentUserDoc = await getDoc(doc(db, "users", uid));
		const currentUserData = currentUserDoc.data();

		// Add friend to current user's friends list
		await addDoc(collection(db, "users", uid, "friends"), {
			uid: request.fromUid,
			username: request.fromUsername,
			email: request.fromEmail,
		});

		// Add current user to friend's friends list
		await addDoc(collection(db, "users", request.fromUid, "friends"), {
			uid: uid,
			username: currentUserData?.username,
			email: currentUserData?.email,
		});

		// Create a chat between the two users
		const chatId = [uid, request.fromUid].sort().join("_");
		await addDoc(collection(db, "chats"), {
			id: chatId,
			participants: [uid, request.fromUid],
			createdAt: new Date(),
		});

		Alert.alert(
			"Success",
			`You are now friends with ${request.fromUsername}`
		);
		return true;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Accept Request Failed", err.message);
        return false;
    }
};

export const rejectFriendRequest = async (
    request: FriendRequest
) => {
    try {
        // Update the friend request status
        await updateDoc(doc(db, "friendRequests", request.id), {
            status: "rejected",
        });

        Alert.alert(
            "Success",
            `Friend request from ${request.fromUsername} rejected`
        );
        return true;
    } catch (e: any) {
        const err = e as FirebaseError;
        Alert.alert("Reject Request Failed", err.message);
        return false;
    }
};

export const deleteFriend = async (
    friend: Friend
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
  
        // Show confirmation dialog
        Alert.alert(
            "Remove Friend",
            `Are you sure you want to remove ${friend.username} from your friends?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Remove friend from current user's friends list
                            await deleteDoc(
                                doc(db, "users", uid, "friends", friend.id)
                            );
            
                            // Remove current user from friend's friends list
                            const friendFriendsQuery = query(
                                collection(db, "users", friend.uid, "friends"),
                                where("uid", "==", uid)
                            );
                            const friendFriendsSnapshot = await getDocs(friendFriendsQuery);
                            if (!friendFriendsSnapshot.empty) {
                                await deleteDoc(
                                    doc(
                                        db,
                                        "users",
                                        friend.uid,
                                        "friends",
                                        friendFriendsSnapshot.docs[0].id
                                    )
                                );
                            }
            
                            // Delete the chat between the two users
                            const chatId = [uid, friend.uid].sort().join("_");
                            await deleteDoc(doc(db, "chats", chatId));
            
                            Alert.alert(
                                "Success",
                                `${friend.username} has been removed from your friends`
                            );
                            return true;
                        } catch (error) {
                            const err = error as FirebaseError;
                            Alert.alert("Remove Friend Failed", err.message);
                            return false;
                        }
                    }
                }
            ]
        );
    } catch (error) {
        const err = error as FirebaseError;
        Alert.alert("Remove Friend Failed", err.message);
        return false;
    }
};

export const addMessage = async (
    message: string,
    chatId: string,
    friendId: string
) => {
    try {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        // Get current user's username
        const currentUserDoc = await getDoc(doc(db, "users", uid));
        const currentUserData = currentUserDoc.data();

        const messageData = {
            senderUid: uid,
            senderUsername: currentUserData?.username || "Unknown",
            message: message.trim(),
            timestamp: new Date(),
        };

        // Check if chat document exists, if not create it
        const chatDocRef = doc(db, "chats", chatId as string);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
            // Create the chat document
            await setDoc(chatDocRef, {
                participants: [uid, friendId as string],
                createdAt: new Date(),
                lastMessage: message.trim(),
                lastMessageTime: new Date(),
            });
        }

        // Add message to chat
        await addDoc(
            collection(db, "chats", chatId as string, "messages"),
            messageData
        );

        // Update chat's last message
        await updateDoc(chatDocRef, {
            lastMessage: message.trim(),
            lastMessageTime: new Date(),
        });

        return true;
    } catch (error) {
        const err = error as FirebaseError;
        Alert.alert("Send Message Failed", err.message);
        return false;
    }
};
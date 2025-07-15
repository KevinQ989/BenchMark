import {
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { RoutineParams, Exercise } from "@/constants/Types";
import { deleteRoutine } from "@/utils/firestoreSaveUtils";
import { getFirestore, doc, getDoc, addDoc, collection } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const RoutinePreviewScreen = () => {
	const router = useRouter();
	const params = useLocalSearchParams();

	const [routine, setRoutine] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [adding, setAdding] = useState(false);

	const currentUser = auth().currentUser;
	const ownerId = Array.isArray(params.ownerId) ? params.ownerId[0] : params.ownerId;
	const routineId = Array.isArray(params.id) ? params.id[0] : params.id;
	const isReadOnly = ownerId && currentUser && ownerId !== currentUser.uid;

	useEffect(() => {
		const fetchRoutine = async () => {
			if (routineId && ownerId) {
				setLoading(true);
				try {
					const db = getFirestore();
					const docRef = doc(db, 'users', ownerId, 'myRoutines', routineId);
					const docSnap = await getDoc(docRef);
					if (docSnap.exists()) {
						setRoutine({ id: docSnap.id, ...docSnap.data() });
					} else {
						setRoutine(null);
					}
				} catch (e) {
					setRoutine(null);
				}
				setLoading(false);
			}
		};
		fetchRoutine();
	}, [routineId, ownerId]);

	let exercises: Exercise[] = [];
	let routineName = params.routineName;
	let description = params.description;

	if (routine) {
		exercises = routine.exercises || [];
		routineName = routine.routineName;
		description = routine.description;
	} else {
		try {
			exercises = typeof params.exercises === 'string' ? JSON.parse(params.exercises) : params.exercises;
		} catch (e) {
			exercises = [];
		}
	}

	const renderExercise = ({ item }: { item: Exercise }) => {
		return (
		<Text>
			{item.sets.length} x {item.exerciseName}
		</Text>
		);
	};

	const handleDeleteRoutine = async () => {
		await deleteRoutine(params.id);
	};

	const handleAddToMyRoutines = async () => {
		if (!currentUser) return;
		setAdding(true);
		try {
			const db = getFirestore();
			await addDoc(collection(db, 'users', currentUser.uid, 'myRoutines'), {
				routineName,
				description,
				exercises,
			});
			alert('Routine added to your routines!');
			router.back();
		} catch (e) {
			alert('Failed to add routine.');
		}
		setAdding(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.title}>{routineName}</Text>
				<Text style={styles.description}>{description}</Text>
				{loading ? (
					<Text>Loading...</Text>
				) : (
					<FlatList
						data={exercises}
						renderItem={renderExercise}
					/>
				)}
				{isReadOnly ? (
					<TouchableOpacity
						style={styles.button}
						onPress={handleAddToMyRoutines}
						disabled={adding}
					>
						<Text style={styles.buttonText}>{adding ? 'Adding...' : 'Add to My Routines'}</Text>
					</TouchableOpacity>
				) : (
					<>
						<TouchableOpacity
							style={styles.button}
							onPress={() =>
								router.replace({
									pathname: "/home/routine",
									params: {
										id: params.id,
										routineName: routineName,
										description: description,
										exercises: JSON.stringify(exercises),
										started: "true",
									},
								})
							}
						>
							<Text style={styles.buttonText}>Start Workout</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.button}
							onPress={() =>
								router.replace({
									pathname: "/home/routine",
									params: {
										id: params.id,
										routineName: routineName,
										description: description,
										exercises: JSON.stringify(exercises),
										started: "false",
									},
								})
							}
						>
							<Text style={styles.buttonText}>Edit Routine</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.button}
							onPress={() =>
								router.replace({
									pathname: "/home/shareRoutine",
									params: {
										routineName: routineName,
										exercises: JSON.stringify(exercises),
									},
								})
							}
						>
							<Text style={styles.buttonText}>Share Routine</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={handleDeleteRoutine}>
							<Text style={styles.buttonText}>Delete Routine</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		padding: 16,
	},

	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: {
		width: 0,
		height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},

	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},

	description: {
		fontSize: 20,
		fontWeight: "300",
		marginBottom: 20,
		textAlign: "center",
	},

	button: {
		backgroundColor: "#4a90e2",
		padding: 10,
		borderRadius: 5,
		marginTop: 10,
		alignItems: "center",
	},

	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	}
});

export default RoutinePreviewScreen;

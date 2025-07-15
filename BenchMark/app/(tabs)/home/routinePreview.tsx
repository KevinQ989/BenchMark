import {
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { RoutineParams, Exercise } from "@/constants/Types";
import { deleteRoutine } from "@/utils/firestoreSaveUtils";

const RoutinePreviewScreen = () => {
	const router = useRouter();
	const params = useLocalSearchParams<RoutineParams>();

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

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.title}>{params.routineName}</Text>
				<Text style={styles.description}>{params.description}</Text>
				<FlatList
					data={JSON.parse(params.exercises)}
					renderItem={renderExercise}
				/>
				<TouchableOpacity
					style={styles.button}
					onPress={() =>
						router.replace({
						pathname: "/home/routine",
						params: {
							id: params.id,
							routineName: params.routineName,
							description: params.description,
							exercises: params.exercises,
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
								routineName: params.routineName,
								description: params.description,
								exercises: params.exercises,
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
								routineName: params.routineName,
								exercises: params.exercises
							},
						})
					}
				>
					<Text style={styles.buttonText}>Share Routine</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={handleDeleteRoutine}>
					<Text style={styles.buttonText}>Delete Routine</Text>
				</TouchableOpacity>
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

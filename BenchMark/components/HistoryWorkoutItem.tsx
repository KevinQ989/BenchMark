import { FlatList, StyleSheet, Text, View } from "react-native";
import { Exercise, WorkoutRecord } from "@/constants/Types";

const HistoryExerciseItem = ({
	item
}: {
	item: Exercise
}) => {
	return (
	<>
		<Text style={styles.gridHeader}>{item.exerciseName}</Text>

		{item.sets.map((set, setIndex) => (
			<View key={setIndex} style={styles.gridRow}>
				<Text style={styles.gridColumn}>{setIndex + 1}</Text>
				<Text style={styles.gridColumn}>{set.weight}kg</Text>
				<Text style={styles.gridColumn}>{set.reps}</Text>
			</View>
		))}
		<View style={styles.divider} />
	</>
	);
};

export const HistoryWorkoutItem = ({
	item
}: {
	item: WorkoutRecord
}) => {
	return (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<Text style={styles.title}>{item.routineName}</Text>
				<Text style={styles.subtitle}>{item.date.toLocaleString()}</Text>
				<Text style={styles.subtitle}>{item.description}</Text>
			</View>
			<FlatList
				data={item.exercises}
				renderItem={HistoryExerciseItem}
				style={styles.listContainer}
			/>
		</View>
	);
};
  
const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 15,
		marginHorizontal: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: {
		width: 0,
		height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},

	cardHeader: {
		backgroundColor: "#f0f0f0",
		padding: 16,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},

	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		paddingBottom: 8,
	},

	subtitle: {
		fontSize: 14,
		fontWeight: "600",
		marginTop: 4,
	},

	listContainer: {
		backgroundColor: "#fff",
		padding: 16,
		borderBottomLeftRadius: 15,
		borderBottomRightRadius: 15,
	},

	gridHeader: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 8,
		marginTop: 12,
	},

	gridRow: {
		flexDirection: "row",
		paddingVertical: 8,
		paddingHorizontal: 4,
		backgroundColor: "#f8f8f8",
		borderRadius: 8,
		marginBottom: 4,
	},

	gridColumn: {
		flex: 1,
		textAlign: "center",
		fontSize: 16,
	},

	divider: {
		height: 1,
		backgroundColor: "#e0e0e0",
		marginVertical: 12,
	}
});
  
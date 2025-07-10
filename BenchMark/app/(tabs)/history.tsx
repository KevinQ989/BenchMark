import React, { useState } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	Text,
	View
} from "react-native";
import { WorkoutRecord } from "@/constants/Types";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { HistoryWorkoutItem } from "@/components/HistoryWorkoutItem";
import { MarkedDates } from "react-native-calendars/src/types";
import { fetchHistory } from "@/utils/firestoreFetchUtils";

const HistoryScreen = () => {
	const [selected, setSelected] = useState<string>(new Date().toISOString().slice(0, 10));
	const [history, setHistory] = useState<WorkoutRecord[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const handleFetchHistory = async () => {
		const history = await fetchHistory();
		setHistory(history.sort((x, y) => y.date - x.date));
	};

	const filterHistory = (date: string, history: WorkoutRecord[]) => {
		return history.filter((item: WorkoutRecord) => item.date.toISOString().slice(0, 10) === date);
	};

	const getMarkedDates = (history: WorkoutRecord[]) => {
		const dates: Date[] = history.map((item: WorkoutRecord) => item.date);
		const markedDates: MarkedDates = {};
		dates.forEach((date: Date) => {
			const dateString = date.toISOString().split("T")[0];
			markedDates[dateString] = {
				marked: true,
				dotColor: "#4CAF50",
				activeOpacity: 0.8
			};
	
		});
		return markedDates;
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchHistory();
		setRefreshing(false);
	};

	useFocusEffect(
		React.useCallback(() => {
			handleFetchHistory();
		}, [])
	);

	return (
		<SafeAreaView style={styles.container}>
			<Calendar
				onDayPress={day => setSelected(day.dateString)}
				markedDates={getMarkedDates(history)}
			/>
			<FlatList
				data={filterHistory(selected, history)}
				renderItem={HistoryWorkoutItem}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
						You have not completed any workouts
						</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},

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
	},

	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		marginTop: 100,
	},

	emptyText: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
	},
});

export default HistoryScreen;

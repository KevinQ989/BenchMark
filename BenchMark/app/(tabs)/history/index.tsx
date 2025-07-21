import React, { useEffect, useRef, useState } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { WorkoutRecord } from "@/constants/Types";
import { useFocusEffect } from "@react-navigation/native";
import { HistoryWorkoutItem } from "@/components/HistoryWorkoutItem";
import { fetchHistory } from "@/utils/firestoreFetchUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

const HistoryScreen = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const historyFlatList = useRef<FlatList<WorkoutRecord>>(null);
	const date = params.date as string | undefined;
	const [history, setHistory] = useState<WorkoutRecord[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const handleFetchHistory = async () => {
		const history = await fetchHistory();
		setHistory(history.sort((x, y) => y.date.getTime() - x.date.getTime()));
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

	useEffect(() => {
		if (date && history.length > 0 && historyFlatList.current) {
			const index = history.findIndex((item: WorkoutRecord) => item.date.toISOString().slice(0, 10) === date)
			if (index !== -1) {
				historyFlatList.current.scrollToIndex({
					index: index,
					animated: true,
					viewPosition: 0
				});
			}
		}
	}, [date, history]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<ThemedText type="title">History</ThemedText>
				<TouchableOpacity
					onPress={() => router.push({
						pathname: '/(tabs)/history/calendar',
						params: {
							history: JSON.stringify(history)
						}
					})}
				>
					<MaterialIcons size={32} name="calendar-month" color={"mediumblue"} />
				</TouchableOpacity>
			</View>
			<FlatList
				data={history}
				renderItem={HistoryWorkoutItem}
				keyExtractor={(item) => item.id}
				ref={historyFlatList}
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
				onScrollToIndexFailed={() => historyFlatList.current.scrollToIndex({
					index: 0,
					animated: true,
					viewPosition: 0
				})}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},

	headerContainer: {
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between"
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

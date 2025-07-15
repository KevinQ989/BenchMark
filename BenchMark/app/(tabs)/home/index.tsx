import { useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Exercise, Routine } from "@/constants/Types";
import { useFocusEffect } from "@react-navigation/native";
import { fetchRoutines, fetchSharedRoutines } from "@/utils/firestoreFetchUtils";
import { addRoutine } from "@/utils/firestoreSaveUtils";

const HomeScreen = () => {
	const router = useRouter();
	const [myRoutines, setMyRoutines] = useState<Routine[]>([]);
	const [sharedRoutines, setSharedRoutines] = useState<Routine[]>([]);

	const handleFetchRoutines = async () => {
		const routines: Routine[] | undefined = await fetchRoutines();
		setMyRoutines(routines ?? []);
	};

	const handleFetchSharedRoutines = async () => {
		const sharedRoutines: Routine[] | undefined = await fetchSharedRoutines();
		setSharedRoutines(sharedRoutines ?? []);
	};

	useFocusEffect(
		React.useCallback(() => {
			handleFetchRoutines();
			handleFetchSharedRoutines();
		}, [])
	);

	const renderExercise = ({ item }: { item: Exercise }) => {
		return (
			<ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">
				{item.sets.length} x {item.exerciseName}
			</ThemedText>
		);
	};

	const renderRoutine = ({ item }: { item: Routine }) => {
		return (
			<TouchableOpacity
				style={styles.routineCard}
				onPress={() =>
					router.push({
						pathname: "/home/routinePreview",
						params: {
							id: item.id,
							routineName: item.routineName,
							description: item.description,
							exercises: JSON.stringify(item.exercises)
						},
					})
				}
			>
				<ThemedText type="subtitle" numberOfLines={1} ellipsizeMode="tail">
					{item.routineName}
				</ThemedText>
				<ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">
					{item.description}
				</ThemedText>
				<FlatList data={item.exercises} renderItem={renderExercise} />
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
		<ScrollView style={styles.scrollView}>
			<View style={styles.subContainer}>
			<ThemedText type="title">My Routines</ThemedText>
			{myRoutines.length === 0 ? (
				<View style={styles.emptyContainer}>
				<View style={[styles.routineCard, styles.centerContent]}>
					<ThemedText type="defaultFaded" style={styles.centerContent}>
					You have not created any routines
					</ThemedText>
				</View>
				<TouchableOpacity
					style={[styles.routineCard, styles.centerContent]}
					onPress={addRoutine}
				>
					<ThemedText type="defaultSemiBold" style={styles.centerContent}>
					Add Routine
					</ThemedText>
				</TouchableOpacity>
				</View>
			) : (
				<FlatList
				data={myRoutines}
				renderItem={renderRoutine}
				horizontal={false}
				numColumns={2}
				columnWrapperStyle={styles.columnWrapper}
				scrollEnabled={false}
				ListFooterComponent={() => {
					return (
					<TouchableOpacity
						style={[styles.routineCard, styles.centerContent]}
						onPress={addRoutine}
					>
						<ThemedText
						type="defaultSemiBold"
						style={styles.centerContent}
						>
						Add Routine
						</ThemedText>
					</TouchableOpacity>
					);
				}}
				/>
			)}
			</View>

			<View style={styles.subContainer}>
			<ThemedText type="title">Shared Routines</ThemedText>
			<FlatList
				data={sharedRoutines}
				renderItem={renderRoutine}
				horizontal={false}
				numColumns={2}
				scrollEnabled={false}
				ListEmptyComponent={() => {
				return (
					<View style={[styles.routineCard, styles.centerContent]}>
					<ThemedText type="defaultFaded" style={styles.centerContent}>
						Your friends have not shared any routines
					</ThemedText>
					</View>
				);
				}}
			/>
			</View>
		</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFF",
	},
	scrollView: {
		flex: 1,
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},

	subContainer: {
		gap: 8,
		marginBottom: 8,
		padding: 16,
	},

	emptyContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},

	centerContent: {
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
	},

	columnWrapper: {
		justifyContent: "space-between",
	},

	routineCard: {
		width: "48%",
		aspectRatio: 1,
		margin: 4,
		borderWidth: 2,
		borderRadius: 5,
		padding: 10,
		overflow: "hidden",
	}
});

export default HomeScreen;

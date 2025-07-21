import React, { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useRouter } from "expo-router";
import { FriendRequest } from "@/constants/Types";
import { FriendRequestItem } from "@/components/FriendRequestItem";
import { fetchFriendRequests } from "@/utils/firestoreFetchUtils";
import { acceptFriendRequest, rejectFriendRequest } from "@/utils/firestoreSaveUtils";

const FriendRequestsScreen = () => {
	const router = useRouter();
	const [requests, setRequests] = useState<FriendRequest[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const handleFetchFriendRequests = async () => {
		const requestsList: FriendRequest[] = await fetchFriendRequests();
		setRequests(requestsList);
	};

	const handleAcceptFriendRequest = async (request: FriendRequest) => {
		const success = await acceptFriendRequest(request);
		if (success) handleFetchFriendRequests();
	};

	const handleRejectFriendRequest = async (request: FriendRequest) => {
		const success = await rejectFriendRequest(request);
		if (success) handleFetchFriendRequests();
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await handleFetchFriendRequests();
		setRefreshing(false);
	};

	useEffect(() => {
		handleFetchFriendRequests();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.backButton} onPress={() => router.back()}>
					Back
				</Text>
				<Text style={styles.title}>Friend Requests</Text>
				<View style={{ width: 50 }} />
			</View>

			<FlatList
				data={requests}
				renderItem={({ item }) => (
					<FriendRequestItem
						request={item}
						onAccept={() => handleAcceptFriendRequest(item)}
						onReject={() => handleRejectFriendRequest(item)}
					/>
				)}
				keyExtractor={(item) => item.id}
				style={styles.requestsList}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No pending friend requests</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5"
	},

	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},

	backButton: {
		fontSize: 16,
		color: "#007AFF"
	},

	title: {
		fontSize: 18,
		fontWeight: "600"
	},

	requestsList: {
		flex: 1
	},

	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100
	},

	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center"
	}
});

export default FriendRequestsScreen;

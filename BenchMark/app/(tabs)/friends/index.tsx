import React, { useState } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import { Friend, FriendRequest } from "@/constants/Types";
import { FriendListItem } from "@/components/FriendListItem";
import { useFocusEffect } from "@react-navigation/native";
import { fetchFriendRequests, fetchFriends } from "@/utils/firestoreFetchUtils";
import { deleteFriend } from "@/utils/firestoreSaveUtils";

const FriendsScreen = () => {
	const router = useRouter();
	const [friends, setFriends] = useState<Friend[]>([]);
	const [pendingRequests, setPendingRequests] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	const handleFetchFriends = async () => {
		const friendsList: Friend[] = await fetchFriends();
		if (friendsList) setFriends(friendsList);
	};

	const handleFetchPendingRequests = async () => {
		const requestsList: FriendRequest[] = await fetchFriendRequests();
		setPendingRequests(requestsList.length ?? 0);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await Promise.all([handleFetchFriends(), handleFetchPendingRequests()]);
		setRefreshing(false);
	};

	const handleFriendPress = (friend: Friend) => {
		const currentUser = auth().currentUser;
		if (!currentUser) return;

		const chatId = [currentUser.uid, friend.uid].sort().join("_");
		router.push({
			pathname: "/friends/chat",
			params: {
				friendId: friend.uid,
				friendUsername: friend.username,
				chatId: chatId,
			},
		});
	};

	const handleAddFriend = () => {
		router.push("/friends/addFriend");
	};

	const handleFriendRequests = () => {
		router.push("/friends/friendRequests");
	};

	const handleDeleteFriend = async (friend: Friend) => {
		const success = await deleteFriend(friend);
		if (success) handleFetchFriends();
	};

	// Refresh friends list when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
		handleFetchFriends();
		handleFetchPendingRequests();
		}, [])
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Friends</Text>
				<View style={styles.headerButtons}>
					<TouchableOpacity
						style={[
						styles.headerButton,
						pendingRequests > 0 && styles.requestsButtonActive,
						]}
						onPress={handleFriendRequests}
					>
						<Text
							style={[
								styles.headerButtonText,
								pendingRequests > 0 && styles.requestsButtonTextActive,
							]}
						>
							Requests
						</Text>
						{pendingRequests > 0 && (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>
								{pendingRequests > 99 ? "99+" : pendingRequests}
								</Text>
							</View>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.headerButton}
						onPress={handleAddFriend}
					>
						<Text style={styles.headerButtonText}>Add</Text>
					</TouchableOpacity>
				</View>
			</View>

			{friends.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>You have not added any friends</Text>
				</View>
			) : (
				<FlatList
					data={friends}
					renderItem={({ item }) => (
						<FriendListItem
							friend={item}
							onPress={() => handleFriendPress(item)}
							onDelete={() => handleDeleteFriend(item)}
						/>
					)}
					keyExtractor={(item) => item.id}
					style={styles.friendsList}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				/>
			)}
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

	title: {
		fontSize: 24,
		fontWeight: "600"
	},

	headerButtons: {
		flexDirection: "row",
		gap: 12
	},

	headerButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8
	},

	headerButtonText: {
		color: "white",
		fontWeight: "600"
	},

	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},

	emptyText: {
		fontSize: 24,
		fontWeight: "600",
		textAlign: "center",
		color: "#666"
	},

	friendsList: {
		flex: 1
	},

	requestsButtonActive: {
		backgroundColor: "#FF3B30"
	},

	requestsButtonTextActive: {
		color: "white"
	},

	badge: {
		backgroundColor: "red",
		borderRadius: 12,
		paddingHorizontal: 4,
		paddingVertical: 2,
		position: "absolute",
		top: -5,
		right: -5
	},

	badgeText: {
		color: "white",
		fontWeight: "600"
	}
});

export default FriendsScreen;

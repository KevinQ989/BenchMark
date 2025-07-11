import React, { useState } from "react";
import {
	Alert,
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { useRouter } from "expo-router";
import { SearchResult } from "@/constants/Types";
import { fetchUsers } from "@/utils/firestoreFetchUtils";
import { sendFriendRequest } from "@/utils/firestoreSaveUtils";

const AddFriendScreen = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);

	const handleFetchUsers = async () => {
		if (!searchQuery.trim()) {
		Alert.alert("Error", "Please enter an email or username to search");
		return;
		}

		setLoading(true);
		const results: SearchResult[] = await fetchUsers(searchQuery);
		setSearchResults(results);
		setLoading(false);
	};

	const handleSendFriendRequest = async (
		targetUid: string,
		targetUsername: string
	) => {
		const success = await sendFriendRequest(targetUid, targetUsername);
		if (success) {
			setSearchResults([]);
			setSearchQuery('');
		}
	};

	const renderSearchResult = ({ item }: { item: SearchResult }) => (
		<View style={styles.resultItem}>
			<View style={styles.resultInfo}>
				<Text style={styles.resultUsername}>{item.username}</Text>
				<Text style={styles.resultEmail}>{item.email}</Text>
			</View>
			<TouchableOpacity
				style={styles.addButton}
				onPress={() => handleSendFriendRequest(item.uid, item.username)}
			>
				<Text style={styles.addButtonText}>Add</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.backButton}>Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Add Friend</Text>
				<View style={{ width: 50 }} />
			</View>

			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search by email or username"
					value={searchQuery}
					onChangeText={setSearchQuery}
					autoCapitalize="none"
				/>
				<TouchableOpacity style={styles.searchButton} onPress={handleFetchUsers}>
					<Text style={styles.searchButtonText}>
						{loading ? "Searching..." : "Search"}
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={searchResults}
				renderItem={renderSearchResult}
				keyExtractor={(item) => item.uid}
				style={styles.resultsList}
				ListEmptyComponent={
					searchResults.length === 0 && searchQuery ? (
						<Text style={styles.noResults}>No users found</Text>
					) : null
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

	searchContainer: {
		flexDirection: "row",
		padding: 16,
		gap: 12
	},

	searchInput: {
		flex: 1,
		height: 44,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: "white"
	},

	searchButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		justifyContent: "center"
	},

	searchButtonText: {
		color: "white",
		fontWeight: "600"
	},

	resultsList: {
		flex: 1
	},

	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0"
	},

	resultInfo: {
		flex: 1
	},

	resultUsername: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4
	},

	resultEmail: {
		fontSize: 14,
		color: "#666"
	},

	addButton: {
		backgroundColor: "#34C759",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8
	},

	addButtonText: {
		color: "white",
		fontWeight: "600"
	},

	noResults: {
		textAlign: "center",
		marginTop: 32,
		fontSize: 16,
		color: "#666"
	}
});

export default AddFriendScreen;

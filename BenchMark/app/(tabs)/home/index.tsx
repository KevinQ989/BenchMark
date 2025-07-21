import { useState, useEffect } from "react";
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
import { fetchRoutines, fetchSharedRoutines, fetchFriends } from "@/utils/firestoreFetchUtils";
import { addRoutine } from "@/utils/firestoreSaveUtils";
import PostCreationModal from '@/components/PostCreationModal';
import SocialFeed from '@/components/SocialFeed';
import { fetchFeedPosts, FeedPost } from '@/utils/firestoreFeedUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {
	const router = useRouter();
	const [myRoutines, setMyRoutines] = useState<Routine[]>([]);
	const [sharedRoutines, setSharedRoutines] = useState<Routine[]>([]);
	const [postModalVisible, setPostModalVisible] = useState(false);
	const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
	const [friendsIds, setFriendsIds] = useState<string[]>([]);
	const insets = useSafeAreaInsets();

	const user = auth().currentUser;
	const userId = user?.uid ?? '';
	const userName = user?.displayName ?? 'Unknown';
	const userAvatar = user?.photoURL ?? null;

	const fetchAndSetFriends = async () => {
		const friends = await fetchFriends();
		if (friends && Array.isArray(friends)) {
			setFriendsIds(friends.map(f => f.uid));
		} else {
			setFriendsIds([]);
		}
	};

	const handleFetchRoutines = async () => {
		const routines: Routine[] | undefined = await fetchRoutines();
		setMyRoutines(routines ?? []);
	};

	const handleFetchSharedRoutines = async () => {
		const sharedRoutines: Routine[] | undefined = await fetchSharedRoutines();
		setSharedRoutines(sharedRoutines ?? []);
	};

	const fetchFeed = async (friendUids?: string[]) => {
		console.log('HomeScreen: fetchFeed called, userId:', userId, 'friendsIds:', friendUids ?? friendsIds);
		const posts = await fetchFeedPosts(userId, friendUids ?? friendsIds);
		setFeedPosts(posts);
	};

	useFocusEffect(
		React.useCallback(() => {
			console.log('HomeScreen: useFocusEffect triggered');
			handleFetchRoutines();
			handleFetchSharedRoutines();
			fetchAndSetFriends().then(() => {
				// fetchFeed will be called in useEffect below after friendsIds is set
			});
		}, [])
	);

	useEffect(() => {
		if (userId) {
			fetchFeed(friendsIds);
		}
	}, [userId, friendsIds.length]);

	const handlePostCreated = () => {
		fetchFeed();
	};

	const renderExercise = ({ item }: { item: Exercise }) => {
		return (
			<ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">
				{item.sets.length} x {item.exerciseName}
			</ThemedText>
		);
	};

	const renderRoutine = ({ item }: { item: Routine }) => {
		const exercisesToShow = item.exercises.slice(0, 3);
		const hasMore = item.exercises.length > 3;
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
				{exercisesToShow.map((ex, idx) => (
					<ThemedText key={idx} type="default" numberOfLines={1} ellipsizeMode="tail">
						{ex.sets.length} x {ex.exerciseName}
					</ThemedText>
				))}
				{hasMore && (
					<ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">...</ThemedText>
				)}
			</TouchableOpacity>
		);
	};

	// Prepare sections for the main FlatList
	const sections = [
		{ key: 'myRoutines' },
		{ key: 'sharedRoutines' },
		{ key: 'socialFeed' },
		{ key: 'shareButton' },
	];

	const renderSection = ({ item }: { item: { key: string } }) => {
		switch (item.key) {
			case 'myRoutines':
				return (
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
								ListFooterComponent={() => (
									<TouchableOpacity
										style={[styles.routineCard, styles.centerContent]}
										onPress={addRoutine}
									>
										<ThemedText type="defaultSemiBold" style={styles.centerContent}>
											Add Routine
										</ThemedText>
									</TouchableOpacity>
								)}
							/>
						)}
					</View>
				);
			case 'sharedRoutines':
				return (
					<View style={styles.subContainer}>
						<ThemedText type="title">Shared Routines</ThemedText>
						<FlatList
							data={sharedRoutines}
							renderItem={renderRoutine}
							horizontal={false}
							numColumns={2}
							scrollEnabled={false}
							ListEmptyComponent={() => (
								<View style={[styles.routineCard, styles.centerContent]}>
									<ThemedText type="defaultFaded" style={styles.centerContent}>
										Your friends have not shared any routines
									</ThemedText>
								</View>
							)}
						/>
					</View>
				);
			case 'socialFeed':
				return (
					<View style={styles.subContainer}>
						<ThemedText type="title">Social Feed</ThemedText>
						<SocialFeed
							posts={feedPosts}
							onRoutinePress={(routineId, routineOwnerId) => {
								router.push({
									pathname: '/home/routinePreview',
									params: { id: routineId, ownerId: routineOwnerId },
								});
							}}
						/>
					</View>
				);
			case 'shareButton':
				return (
					<TouchableOpacity
						style={styles.shareButton}
						onPress={() => setPostModalVisible(true)}
					>
						<ThemedText type="defaultSemiBold" style={{ color: '#fff', textAlign: 'center' }}>
							Share Workout
						</ThemedText>
					</TouchableOpacity>
				);
			default:
				return null;
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<FlatList
				data={sections}
				renderItem={renderSection}
				keyExtractor={item => item.key}
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				ListHeaderComponent={<View style={{ height: 8 }} />}
			/>
			<PostCreationModal
				visible={postModalVisible}
				onClose={() => setPostModalVisible(false)}
				onPostCreated={handlePostCreated}
				routines={myRoutines}
				userId={userId}
				userName={userName}
				userAvatar={userAvatar || undefined}
			/>
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
	,
	shareButton: {
		backgroundColor: '#4a90e2',
		padding: 16,
		borderRadius: 30,
		alignItems: 'center',
		margin: 16,
		elevation: 2,
	},
});

export default HomeScreen;

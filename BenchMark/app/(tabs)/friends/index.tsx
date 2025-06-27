import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  doc,
  getDoc,
  where,
  deleteDoc,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { Friend } from "@/constants/Types";
import { FriendListItem } from "@/components/FriendListItem";
import { useFocusEffect } from "@react-navigation/native";

const FriendsScreen = () => {
  const router = useRouter();
  const db = getFirestore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriends = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Get user's friends
      const friendsQuery = query(
        collection(db, "users", currentUser.uid, "friends")
      );
      const friendsSnapshot = await getDocs(friendsQuery);

      const friendsList: Friend[] = [];

      for (const friendDoc of friendsSnapshot.docs) {
        const friendData = friendDoc.data();

        // Get the chat between current user and this friend
        const chatId = [currentUser.uid, friendData.uid].sort().join("_");
        const chatDoc = await getDoc(doc(db, "chats", chatId));

        let lastMessage = "";
        let lastMessageTime: Date | undefined;

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          lastMessage = chatData?.lastMessage || "";
          lastMessageTime = chatData?.lastMessageTime?.toDate();
        }

        friendsList.push({
          id: friendDoc.id,
          uid: friendData.uid,
          username: friendData.username,
          email: friendData.email,
          lastMessage,
          lastMessageTime,
        });
      }

      // Sort friends by last message time (most recent first)
      friendsList.sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });

      setFriends(friendsList);
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Fetch Friends Failed", err.message);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const requestsQuery = query(
        collection(db, "friendRequests"),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      setPendingRequests(requestsSnapshot.size);
    } catch (error) {
      console.log("Error fetching pending requests:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFriends(), fetchPendingRequests()]);
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
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        "Remove Friend",
        `Are you sure you want to remove ${friend.username} from your friends?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                // Remove friend from current user's friends list
                await deleteDoc(
                  doc(db, "users", currentUser.uid, "friends", friend.id)
                );

                // Remove current user from friend's friends list
                const friendFriendsQuery = query(
                  collection(db, "users", friend.uid, "friends"),
                  where("uid", "==", currentUser.uid)
                );
                const friendFriendsSnapshot = await getDocs(friendFriendsQuery);
                if (!friendFriendsSnapshot.empty) {
                  await deleteDoc(
                    doc(
                      db,
                      "users",
                      friend.uid,
                      "friends",
                      friendFriendsSnapshot.docs[0].id
                    )
                  );
                }

                // Delete the chat between the two users
                const chatId = [currentUser.uid, friend.uid].sort().join("_");
                await deleteDoc(doc(db, "chats", chatId));

                Alert.alert(
                  "Success",
                  `${friend.username} has been removed from your friends`
                );

                // Refresh the friends list
                fetchFriends();
              } catch (error) {
                const err = error as FirebaseError;
                Alert.alert("Remove Friend Failed", err.message);
              }
            },
          },
        ]
      );
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Remove Friend Failed", err.message);
    }
  };

  // Refresh friends list when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
      fetchPendingRequests();
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#666",
  },
  friendsList: {
    flex: 1,
  },
  requestsButtonActive: {
    backgroundColor: "#FF3B30",
  },
  requestsButtonTextActive: {
    color: "white",
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: "absolute",
    top: -5,
    right: -5,
  },
  badgeText: {
    color: "white",
    fontWeight: "600",
  },
});

export default FriendsScreen;

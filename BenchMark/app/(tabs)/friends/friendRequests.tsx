import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getFirestore,
  addDoc,
  deleteDoc,
  getDoc,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { FriendRequest } from "@/constants/Types";
import { FriendRequestItem } from "@/components/FriendRequestItem";

const FriendRequestsScreen = () => {
  const router = useRouter();
  const db = getFirestore();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriendRequests = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const requestsQuery = query(
        collection(db, "friendRequests"),
        where("toUid", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);

      const requestsList: FriendRequest[] = requestsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fromUid: data.fromUid,
          fromUsername: data.fromUsername,
          fromEmail: data.fromEmail,
          toUid: data.toUid,
          status: data.status,
          timestamp: data.timestamp.toDate(),
        };
      });

      setRequests(requestsList);
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Fetch Requests Failed", err.message);
    }
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Update the friend request status
      await updateDoc(doc(db, "friendRequests", request.id), {
        status: "accepted",
      });

      // Add to friends collection for both users
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserDoc.data();

      // Add friend to current user's friends list
      await addDoc(collection(db, "users", currentUser.uid, "friends"), {
        uid: request.fromUid,
        username: request.fromUsername,
        email: request.fromEmail,
      });

      // Add current user to friend's friends list
      await addDoc(collection(db, "users", request.fromUid, "friends"), {
        uid: currentUser.uid,
        username: currentUserData?.username,
        email: currentUserData?.email,
      });

      // Create a chat between the two users
      const chatId = [currentUser.uid, request.fromUid].sort().join("_");
      await addDoc(collection(db, "chats"), {
        id: chatId,
        participants: [currentUser.uid, request.fromUid],
        createdAt: new Date(),
      });

      Alert.alert(
        "Success",
        `You are now friends with ${request.fromUsername}`
      );
      fetchFriendRequests(); // Refresh the list
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Accept Request Failed", err.message);
    }
  };

  const rejectFriendRequest = async (request: FriendRequest) => {
    try {
      // Update the friend request status
      await updateDoc(doc(db, "friendRequests", request.id), {
        status: "rejected",
      });

      Alert.alert(
        "Success",
        `Friend request from ${request.fromUsername} rejected`
      );
      fetchFriendRequests(); // Refresh the list
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Reject Request Failed", err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriendRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFriendRequests();
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
            onAccept={() => acceptFriendRequest(item)}
            onReject={() => rejectFriendRequest(item)}
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
  backButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  requestsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default FriendRequestsScreen;

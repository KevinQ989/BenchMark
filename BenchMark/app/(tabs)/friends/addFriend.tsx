import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getFirestore,
  doc,
  getDoc,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";

interface SearchResult {
  uid: string;
  username: string;
  email: string;
}

const AddFriendScreen = () => {
  const router = useRouter();
  const db = getFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter an email or username to search");
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Search by email
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", searchQuery.toLowerCase())
      );
      const emailSnapshot = await getDocs(emailQuery);

      // Search by username
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", searchQuery)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      const results: SearchResult[] = [];

      // Combine results from both queries
      emailSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== currentUser.uid) {
          results.push({
            uid: doc.id,
            username: data.username,
            email: data.email,
          });
        }
      });

      usernameSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (
          doc.id !== currentUser.uid &&
          !results.find((r) => r.uid === doc.id)
        ) {
          results.push({
            uid: doc.id,
            username: data.username,
            email: data.email,
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Search Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (
    targetUid: string,
    targetUsername: string,
    targetEmail: string
  ) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Get current user's data
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserDoc.data();

      // Check if friend request already exists
      const existingRequestQuery = query(
        collection(db, "friendRequests"),
        where("fromUid", "==", currentUser.uid),
        where("toUid", "==", targetUid),
        where("status", "==", "pending")
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        Alert.alert("Error", "Friend request already sent");
        return;
      }

      // Send friend request
      await addDoc(collection(db, "friendRequests"), {
        fromUid: currentUser.uid,
        fromUsername: currentUserData?.username,
        fromEmail: currentUserData?.email,
        toUid: targetUid,
        status: "pending",
        timestamp: new Date(),
      });

      Alert.alert("Success", `Friend request sent to ${targetUsername}`);
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Send Request Failed", err.message);
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
        onPress={() => sendFriendRequest(item.uid, item.username, item.email)}
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
        <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
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
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultInfo: {
    flex: 1,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultEmail: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  noResults: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#666",
  },
});

export default AddFriendScreen;

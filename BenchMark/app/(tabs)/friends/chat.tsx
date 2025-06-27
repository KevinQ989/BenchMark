import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  getFirestore,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { ChatMessage } from "@/constants/Types";

const ChatScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const db = getFirestore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const tabBarHeight = Platform.OS === "ios" ? 33 : 0; // 33px padding of chat bar
  const bottomPadding = insets.bottom + tabBarHeight;

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      // Get current user's username
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserDoc.data();

      const messageData = {
        senderUid: currentUser.uid,
        senderUsername: currentUserData?.username || "Unknown",
        message: newMessage.trim(),
        timestamp: new Date(),
      };

      // Check if chat document exists, if not create it
      const chatDocRef = doc(db, "chats", params.chatId as string);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        // Create the chat document
        await setDoc(chatDocRef, {
          participants: [currentUser.uid, params.friendId as string],
          createdAt: new Date(),
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date(),
        });
      }

      // Add message to chat
      await addDoc(
        collection(db, "chats", params.chatId as string, "messages"),
        messageData
      );

      // Update chat's last message
      await updateDoc(chatDocRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date(),
      });

      setNewMessage("");
    } catch (error) {
      const err = error as FirebaseError;
      Alert.alert("Send Message Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser || !params.chatId) return;

    // Listen to messages in real-time
    const messagesQuery = query(
      collection(db, "chats", params.chatId as string, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderUid: data.senderUid,
            senderUsername: data.senderUsername,
            message: data.message,
            timestamp: data.timestamp.toDate(),
          };
        });
        setMessages(messagesList);
      },
      (error) => {
        // Handle error silently - chat might not exist yet
        console.log("Chat messages error:", error);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [params.chatId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const currentUser = auth().currentUser;
    const isOwnMessage = item.senderUid === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {item.message}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{params.friendUsername as string}</Text>
        <View style={{ width: 50 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[styles.inputContainer, { paddingBottom: bottomPadding }]}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? "Sending..." : "Send"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  ownMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "black",
  },
  messageTime: {
    fontSize: 12,
  },
  ownMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#666",
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ChatScreen;

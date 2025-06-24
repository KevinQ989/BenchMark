import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Friend } from "./Types";

interface FriendListItemProps {
  friend: Friend;
  onPress: () => void;
  onDelete: () => void;
}

export const FriendListItem: React.FC<FriendListItemProps> = ({
  friend,
  onPress,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    onDelete();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.contentContainer} onPress={onPress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {friend.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.username}>{friend.username}</Text>
          {friend.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {friend.lastMessage}
            </Text>
          )}
        </View>
        {friend.lastMessageTime && (
          <Text style={styles.time}>{formatTime(friend.lastMessageTime)}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
        <Text style={styles.menuButtonText}>⋯</Text>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Text style={styles.deleteText}>Remove Friend</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingRight: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -22,
  },
  menuButtonText: {
    color: "#666",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 150,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  deleteText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
  },
});

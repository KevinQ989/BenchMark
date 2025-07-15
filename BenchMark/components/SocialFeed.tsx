import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FeedPost } from '@/utils/firestoreFeedUtils';

interface SocialFeedProps {
  posts: FeedPost[];
  onRoutinePress?: (routineId: string, routineOwnerId?: string) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onRoutinePress }) => {
  const renderItem = ({ item }: { item: FeedPost }) => {
    // Fix timestamp rendering
    let dateObj: Date | null = null;
    if (item.timestamp && typeof item.timestamp.toDate === 'function') {
      dateObj = item.timestamp.toDate();
    } else if (item.timestamp instanceof Date) {
      dateObj = item.timestamp;
    }
    const dateString = dateObj ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString() : '';

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.username}>{item.userName || 'Unknown'}</Text>
          <Text style={styles.timestamp}>{dateString || ''}</Text>
        </View>
        <Image source={{ uri: item.photoUrl }} style={styles.photo} />
        {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
        {item.routineId && item.routineName && (
          <TouchableOpacity
            style={styles.routineTag}
            onPress={() => onRoutinePress && onRoutinePress(item.routineId!, item.routineOwnerId)}
          >
            <Text style={styles.routineText}>🏷 {item.routineName}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!posts || posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet. Share your first workout!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id || Math.random().toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  caption: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
  },
  routineTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  routineText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default SocialFeed; 
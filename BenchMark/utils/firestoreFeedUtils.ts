import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export type FeedPost = {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  photoUrl: string;
  caption: string;
  routineId?: string;
  routineName?: string;
  routineOwnerId?: string;
  timestamp?: any; // Accepts Date, Firestore Timestamp, or FieldValue
};

export async function uploadPhotoAsync(uri: string, userId: string): Promise<string> {
  // Generate a unique file path
  const fileName = `${userId}_${Date.now()}`;
  const storageRef = storage().ref(`feedPhotos/${fileName}`);

  // Log the uri for debugging
  console.log('uploadPhotoAsync: uploading file', uri, 'for user', userId);

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    await storageRef.put(blob);
  } catch (error) {
    console.error('uploadPhotoAsync: failed to upload file as blob', uri, error);
    throw error;
  }

  // Get the download URL
  try {
    const url = await storageRef.getDownloadURL();
    console.log('uploadPhotoAsync: got download URL', url);
    return url;
  } catch (error) {
    console.error('uploadPhotoAsync: failed to get download URL', error);
    throw error;
  }
}

export async function createPost({
  userId,
  userName,
  userAvatar,
  photoUri,
  caption,
  routineId,
  routineName,
}: {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  photoUri: string;
  caption: string;
  routineId?: string;
  routineName?: string;
}): Promise<void> {
  let photoUrl;
  try {
    photoUrl = await uploadPhotoAsync(photoUri, userId);
  } catch (error) {
    console.error('createPost: failed to upload photo', photoUri, error);
    throw error;
  }
  // Fetch user profile from Firestore
  let finalUserName = userName;
  let finalUserAvatar = userAvatar;
  try {
    const userDoc = await firestore().doc(`users/${userId}`).get();
    if (userDoc.exists()) {
      const data = userDoc.data();
      finalUserName = data?.username || finalUserName;
      finalUserAvatar = data?.photoURL || finalUserAvatar;
    }
  } catch (e) {
    console.warn('createPost: failed to fetch user profile', e);
  }
  const post: FeedPost = {
    userId,
    userName: finalUserName,
    photoUrl,
    caption,
    routineId,
    routineName,
    ...(routineId ? { routineOwnerId: userId } : {}),
    timestamp: firestore.FieldValue.serverTimestamp(),
    ...(finalUserAvatar !== undefined ? { userAvatar: finalUserAvatar ?? null } : {}),
  };
  try {
    await firestore().collection('posts').add(post);
  } catch (error) {
    console.error('createPost: failed to add post to Firestore', post, error);
    throw error;
  }
}

export async function fetchFeedPosts(userId: string, friendsIds: string[]): Promise<FeedPost[]> {
  if (!userId) return [];
  const ids = [userId, ...friendsIds].filter(Boolean);
  const snapshot = await firestore().collection('posts').orderBy('timestamp', 'desc').get();
  console.log('fetchFeedPosts: found', snapshot.docs.length, 'posts (unfiltered)');
  const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
  const filtered = allPosts.filter(post => ids.includes(post.userId));
  console.log('fetchFeedPosts: returning', filtered.length, 'posts after filtering for ids', ids);
  return filtered;
} 
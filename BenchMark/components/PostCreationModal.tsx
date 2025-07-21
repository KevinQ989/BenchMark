import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Routine } from '@/constants/Types';
import { createPost } from '@/utils/firestoreFeedUtils';

interface PostCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  routines: Routine[];
  userId: string;
  userName: string;
  userAvatar?: string;
}

const PostCreationModal: React.FC<PostCreationModalProps> = ({ visible, onClose, onPostCreated, routines, userId, userName, userAvatar }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      setError('Please select a photo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createPost({
        userId,
        userName,
        userAvatar,
        photoUri,
        caption,
        routineId: selectedRoutine?.id,
        routineName: selectedRoutine?.routineName,
      });
      setPhotoUri(null);
      setCaption('');
      setSelectedRoutine(null);
      onPostCreated();
      onClose();
    } catch (e) {
      console.error('Failed to create post:', e); // Log the error for debugging
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Share Workout</Text>
          <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>Pick a Photo</Text>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
          />
          <Text style={styles.label}>Tag a Routine (optional):</Text>
          <FlatList
            data={routines}
            keyExtractor={item => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.routineTag, selectedRoutine?.id === item.id && styles.selectedRoutine]}
                onPress={() => setSelectedRoutine(item)}
              >
                <Text style={styles.routineText}>{item.routineName}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.noRoutines}>No routines</Text>}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  photoPicker: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#eee',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 120,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    minHeight: 48,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  routineTag: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedRoutine: {
    backgroundColor: '#4a90e2',
  },
  routineText: {
    color: '#333',
  },
  noRoutines: {
    color: '#aaa',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostCreationModal; 
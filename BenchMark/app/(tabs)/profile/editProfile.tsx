import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import storage from "@react-native-firebase/storage";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput } from "react-native-gesture-handler";
import { UserData } from "@/constants/Types";
import { fetchUserData } from "@/utils/firestoreFetchUtils";
import { saveUserData } from "@/utils/firestoreSaveUtils";

const EditProfileScreen = () => {
    const uid = auth().currentUser?.uid;
    const [username, setUsername] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    
    const handleFetchUserData = async () => {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        const userData: UserData | undefined = await fetchUserData(uid);
        if (userData) {
            setUsername(userData.username);
            setPhotoURL(userData.photoURL);
        }
    };

    const setProfilePhoto = async () => {
        const imageUri = await pickImage();
        if (imageUri) {
            await uploadImage(imageUri);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })
        
        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    };

    const uploadImage = async (imageUri: string) => {
        setUploading(true);
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const filename = `Profile Photos/${uid}_${Date.now()}.jpg`;
            const reference = storage().ref(filename);
            await reference.put(blob);
            const downloadURL = await reference.getDownloadURL();
            setPhotoURL(downloadURL);
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Upload Image Failed", err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveUserData = async () => {
        await saveUserData(username, photoURL);
    };

    useEffect(() => {
        handleFetchUserData();
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Button title="Sign Out" onPress={() => auth().signOut()} />
                <Button title="Save Profile" onPress={handleSaveUserData} />
            </View>
            <View style={styles.imageContainer}>
                    {uploading ? (
                        <ActivityIndicator size="large" />
                    ) : photoURL ? (
                        <Image
                            source={{ uri: photoURL }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <View style={styles.placeholderPhoto}>
                            <MaterialIcons size={60} name="person" color={"#999999"} />
                        </View>
                    )}
                <Button title="Edit Profile Photo" onPress={setProfilePhoto} />
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                    style={styles.fieldInput}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 24
    },

    imageContainer: {
        alignItems: "center",
        paddingVertical: 32
    },

    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F0F0F0"
    },

    placeholderPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center"
    },

    fieldContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#E0E0E0",
        marginHorizontal: 16,
        marginTop: 24
    },

    fieldLabel: {
        fontSize: 16,
        color: "#000000",
        width: 80,
        fontWeight: "400"
    },

    fieldInput: {
        flex: 1,
        fontSize: 16,
        color: "#000000",
        paddingVertical: 8,
        marginLeft: 16
    }
});

export default EditProfileScreen;
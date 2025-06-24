import { Alert, Button, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import storage from "@react-native-firebase/storage";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TextInput } from "react-native-gesture-handler";

const EditProfileScreen = () => {
    const uid = auth().currentUser?.uid;
    const params = useLocalSearchParams();
    const [username, setUsername] = useState<string>(params.username as string|| '');
    const [photoURL, setPhotoURL] = useState<string | null>(params.photoURL as string);
    const [uploading, setUploading] = useState<boolean>(false);
    
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

    const saveProfile = async () => {
        try {
            const db = getFirestore();
            if (uid) {
                await updateDoc(doc(db, "users", uid), {
                    username: username,
                    photoURL: photoURL
                })
            } else {
                Alert.alert("Save Profile Failed", "No User Logged In")
            }
            const router = useRouter();
            router.replace("/profile");
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Save Profile Failed", err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Button title="Sign Out" onPress={() => auth().signOut()} />
                <Button title="Save Profile" onPress={saveProfile} />
            </View>
            <View style={styles.imageContainer}>
                    {photoURL ? (
                        <Image
                            source={{ uri: photoURL }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <IconSymbol size={28} name="person.fill" color={"#430589"} />
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
        margin: 10,
        backgroundColor: "#FFF"
    },
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
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

    fieldContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#E0E0E0"
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
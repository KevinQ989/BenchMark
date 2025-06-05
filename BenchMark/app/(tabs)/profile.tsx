import { Alert, Button, SafeAreaView, StyleSheet, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";

const ProfileScreen = () => {
    const db = getFirestore();
    const [username, setUsername] = useState<String>('');

    const fetchUsername = async () => {
        try {
        const uid = auth().currentUser?.uid;
        const userData = await getDoc(doc(db, "users", uid));
        if (userData) {
            setUsername(userData.data().username);
        }
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch Username Failed", err.message);
        }
    };

    useEffect(() => {
        fetchUsername();
    }, []);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <ThemedText type="title">Welcome {username}</ThemedText>
                <HelloWave />
            </View>
            <View style={styles.subContainer}>
                <Button title="Sign Out" onPress={() => auth().signOut()} />
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
      gap: 8,
    },
    
    subContainer: {
      gap: 8,
      marginBottom: 8,
    }
});

export default ProfileScreen;
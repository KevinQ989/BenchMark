import { Alert, Button, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { Metric, WorkoutRecord } from "@/components/Types";

const EditProfileScreen = () => {
    const saveProfile = async () => {
        try {

        } catch (e) {
            const err = e as FirebaseError;
            Alert.alert("Save Profile Failed", err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View>
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
});

export default EditProfileScreen;
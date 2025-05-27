import { useState, useEffect } from "react";
import { View, FlatList, ScrollView, SafeAreaView, Text, Button, StyleSheet } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";

const HomeScreen = () => {
  interface Exercise {
    exerciseName: string;
    reps: number;
    sets: number;
  }
  
  interface Routine {
    id: string;
    routineName: string;
    description: string;
    exercises: Exercise[];
  }
  
  const [username, setUsername] = useState('');
  const [myRoutines, setMyRoutines] = useState<Routine[]>([]);
  const [sharedRoutines, setSharedRoutines] = useState<Routine[]>([]);

  const fetchUsername = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const userData = await firestore().collection("users").doc(uid).get();
      if (userData) {
        setUsername(userData.data().username);
      }
    } catch (e) {
      console.log("Error receiving username: " + e.message);
    }
  };

  const fetchRoutines = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const userRoutines = await firestore().collection("users").doc(uid).collection("myRoutines").get();
      const routines = userRoutines.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyRoutines(routines);
    } catch (e) {
      console.log("Error receiving routines: " + e.message);
    }
  };

  useEffect(() => {
    fetchUsername();
    fetchRoutines();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome {username}</ThemedText>
          <HelloWave />
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <ThemedText type="title">My Routines</ThemedText>
          { myRoutines.length === 0 ? (
            <View style={styles.routine}>
              <Text>No routines</Text>
            </View>
          ) : (
            <FlatList 
              data={myRoutines}
              renderItem={({item}: {item: Routine}) => (
                <View style={styles.routine}>
                  <ThemedText type="subtitle">{item.routineName}</ThemedText>
                  <ThemedText type="default">{item.description}</ThemedText>
                </View>
              )}
            />
          )}
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <ThemedText type="title">My Routines</ThemedText>
          { sharedRoutines.length === 0 ? (
            <View style={styles.routine}>
              <ThemedText type="default">Your friends have not shared any routines</ThemedText>
            </View>
          ) : (
            <FlatList 
              data={sharedRoutines}
              renderItem={({item}: {item: Routine}) => (
                <View style={styles.routine}>
                  <ThemedText type="subtitle">{item.routineName}</ThemedText>
                  <ThemedText type="default">{item.description}</ThemedText>
                </View>
              )}
            />
          )}
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <Button title="Sign Out" onPress={() => auth().signOut()} />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  
  routine: {
    margin: 10,
    border: 2,
    borderWidth: 2,
    borderRadius: 5,
    padding: 5
  }
});

export default HomeScreen;
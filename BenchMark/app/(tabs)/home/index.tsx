import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScrollView, View, FlatList, SafeAreaView, Button, StyleSheet, TouchableOpacity } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Exercise, Routine } from "@/components/Types";

const HomeScreen = () => {
  const renderExercise = ({item}: {item: Exercise}) => {
    return (
        <ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">{item.sets.length} x {item.exerciseName}</ThemedText>
    );
  };

  const renderRoutine = ({item}: {item: Routine}) => {
    const router = useRouter();
    return (
      <TouchableOpacity style={styles.routineCard} onPress={() => router.push({
        pathname: '/home/previewRoutine',
        params: {
          id: item.id,
          routineName: item.routineName,
          description: item.description,
          exercises: JSON.stringify(item.exercises)
        }
      })}>
          <ThemedText type="subtitle" numberOfLines={1} ellipsizeMode="tail">{item.routineName}</ThemedText>
          <ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">{item.description}</ThemedText>
          <FlatList 
            data={item.exercises}
            renderItem={renderExercise}
          />
      </TouchableOpacity>
    );
  };

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
      const routines = userRoutines.docs.map(doc => {
        const data = doc.data();
        const exercises = data.exercises.map((exercise: any, exerciseIndex: number) => {
          const sets = exercise.sets.map((set: any, setIndex: number) => ({
            setNum: setIndex + 1,
            weight: set.weight,
            reps: set.reps,
          }));

          return {
            exerciseName: exercise.exerciseName,
            sets: sets
          };
        });

        return {
          id: doc.id,
          routineName: data.routineName,
          description: data.description,
          exercises: exercises
        }
      });
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
        <View style={styles.titleContainer}>
          <ThemedText type="title">Welcome {username}</ThemedText>
          <HelloWave />
        </View>

        <View style={styles.subContainer}>
          <ThemedText type="title">My Routines</ThemedText>
          {myRoutines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.routineCard, styles.centerContent]}>
                <ThemedText type="defaultFaded" style={styles.centerContent}>You have not created any routines</ThemedText>
              </View>
              <TouchableOpacity style={[styles.routineCard, styles.centerContent]}>
                <ThemedText type="defaultSemiBold" style={styles.centerContent}>Add Routine</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList 
              data={myRoutines}
              renderItem={renderRoutine}
              horizontal={false}
              numColumns="2"
              columnWrapperStyle={styles.columnWrapper}
              ListFooterComponent={() => {
                return (
                  <TouchableOpacity style={[styles.routineCard, styles.centerContent]}>
                    <ThemedText type="defaultSemiBold" style={styles.centerContent}>Add Routine</ThemedText>
                  </TouchableOpacity>
                )
              }}
            />
          )}
        </View>

        <View style={styles.subContainer}>
          <ThemedText type="title">Shared Routines</ThemedText>
          <FlatList 
              data={sharedRoutines}
              renderItem={renderRoutine}
              horizontal={false}
              numColumns="2"
              ListEmptyComponent={() => {
                return (
                  <View style={[styles.routineCard, styles.centerContent]}>
                    <ThemedText type="defaultFaded" style={styles.centerContent}>Your friends have not shared any routines</ThemedText>
                  </View>
                )
              }}
          />
        </View>

        <View style={styles.subContainer}>
          <Button title="Sign Out" onPress={() => auth().signOut()} />
        </View>
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

  emptyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },

  columnWrapper: {
    justifyContent: "space-between"
  },
  
  routineCard: {
    width: "48%",
    aspectRatio: 1,
    margin: 4,
    borderWidth: 2,
    borderRadius: 5,
    padding: 10,
    overflow: "hidden"
  }
});

export default HomeScreen;
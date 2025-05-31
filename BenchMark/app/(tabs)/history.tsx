import { useState, useEffect } from "react";
import { View, FlatList, SafeAreaView, Text, StyleSheet } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import React from "react";
import { Exercise, WorkoutRecord } from "@/components/Types";
import { FirebaseError } from "firebase/app";

const HistoryScreen = () => {
  const [history, setHistory] = useState<WorkoutRecord[]>([]);

  const fetchHistory = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const userHistory = await firestore().collection("users").doc(uid)
        .collection("myWorkouts").get();
      const history = userHistory.docs.map(doc => {
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
          exercises: exercises,
          date: data.date
        }
      });
      setHistory(history);
    } catch (e: any) {
        const err = e as FirebaseError;
        alert("Fetch History Failed: " + err.message);
    }
  };

  const renderExercise = ({item, index: exerciseIndex}: {item: Exercise, index: number}) => {
    return (
        <>
            <Text style={styles.gridHeader}>{item.exerciseName}</Text>

            {item.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.gridRow}>
                    <Text style={styles.gridColumn}>{setIndex + 1}</Text>
                    <Text style={styles.gridColumn}>{set.weight}kg</Text>
                    <Text style={styles.gridColumn}>{set.reps}</Text>
                </View>
            ))}
            <View style={styles.divider} />
        </>
    )
};

  const renderWorkout = ({item}: {item: WorkoutRecord}) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.routineName}</Text>
                <Text style={styles.subtitle}>{item.date}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
            </View>
            <FlatList
                data={item.exercises}
                renderItem={renderExercise}
                style={styles.listContainer}
            />
        </View>
    )
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
            data={history}
            renderItem={renderWorkout}
            ListEmptyComponent={(
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You have not completed any workouts</Text>
                </View>
            )}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#fff"
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },

    cardHeader: {
        backgroundColor: "#f0f0f0",
        padding: 16,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0"
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        paddingBottom: 8
    },

    subtitle: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4
    },

    listContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },

    gridHeader: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 12
    },

    gridRow: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        marginBottom: 4
    },

    gridColumn: {
        flex: 1,
        textAlign: "center",
        fontSize: 16
    },

    divider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 12
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center", 
        padding: 20,
        marginTop: 100
    },

    emptyText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24
    }
});

export default HistoryScreen;
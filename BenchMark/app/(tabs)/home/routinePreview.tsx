import {
  Alert,
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { RoutineParams } from "@/components/Types";
import { Exercise } from "@/components/Types";
import { doc, deleteDoc, getFirestore } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

const RoutinePreviewScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<RoutineParams>();

  const renderExercise = ({ item }: { item: Exercise }) => {
    return (
      <Text>
        {item.sets.length} x {item.exerciseName}
      </Text>
    );
  };

  const deleteRoutine = async () => {
    try {
      const db = getFirestore();
      const uid = auth().currentUser?.uid;

      if (!uid) {
        Alert.alert("Error", "You must be logged in to delete a routine");
        return;
      }

      if (!params.id) {
        Alert.alert("Error", "Routine ID is missing");
        return;
      }

      await deleteDoc(doc(db, "users", uid, "myRoutines", params.id));
      Alert.alert("Success", "Routine deleted successfully");
      router.replace("/(tabs)/home");
    } catch (e) {
      const err = e as FirebaseError;
      Alert.alert("Delete Routine Failed", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{params.routineName}</Text>
        <Text style={styles.description}>{params.description}</Text>
        <FlatList
          data={JSON.parse(params.exercises)}
          renderItem={renderExercise}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.replace({
              pathname: "/home/routine",
              params: {
                id: params.id,
                routineName: params.routineName,
                description: params.description,
                exercises: params.exercises,
                started: "true",
              },
            })
          }
        >
          <Text style={styles.addText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.replace({
              pathname: "/home/routine",
              params: {
                id: params.id,
                routineName: params.routineName,
                description: params.description,
                exercises: params.exercises,
                started: "false",
              },
            })
          }
        >
          <Text style={styles.editText}>Edit Routine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteRoutine}>
          <Text style={styles.deleteText}>Delete Routine</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 20,
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },

  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  editButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RoutinePreviewScreen;

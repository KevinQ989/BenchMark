import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { FirebaseError } from "firebase/app";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ExerciseInfo, RoutineParams } from "@/components/Types";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";

const AddExercisesScreen = () => {
  const db = getFirestore();
  const router = useRouter();
  const params = useLocalSearchParams<RoutineParams>();
  const [allExercises, setAllExercises] = useState<ExerciseInfo[]>([]);
  const [selected, setSelected] = useState<ExerciseInfo[]>([]);

  const fetchExercises = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "exercises"));
      const exercises = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          exerciseName: data.exerciseName,
          target: data.target,
          subTarget: data.subTarget,
          equipment: data.equipment,
        };
      });
      setAllExercises(exercises);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Fetch Exercises Failed: " + err.message);
    }
  };

  const toggle = (item: ExerciseInfo) => {
    setSelected((prev) => {
      const isSelected = prev.some(
        (exercise) => exercise.exerciseName === item.exerciseName
      );
      if (isSelected) {
        return prev.filter(
          (exercise) => exercise.exerciseName !== item.exerciseName
        );
      } else {
        return [...prev, item];
      }
    });
  };

  const renderExercise = ({ item }: { item: ExerciseInfo }) => {
    return (
      <TouchableOpacity
        style={selected.includes(item) ? styles.selected : styles.unselected}
        onPress={() => toggle(item)}
      >
        <Text style={styles.exerciseName}>{item.exerciseName}</Text>
      </TouchableOpacity>
    );
  };

  const saveSelected = () => {
    const currentExercises = JSON.parse(params.exercises);
    const newExercises = selected.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      sets: [
        {
          weight: 0,
          reps: 0,
        },
      ],
    }));
    const updatedExercises = [...currentExercises, ...newExercises];
    router.push({
      pathname: "/(tabs)/home/routine",
      params: {
        id: params.id,
        routineName: params.routineName,
        description: params.description,
        started: params.started,
        exercises: JSON.stringify(updatedExercises),
      },
    });
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackTitle: "",
          headerRight: () => (
            <Button onPress={saveSelected} title="Add Exercises" />
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <FlatList
            data={allExercises}
            renderItem={renderExercise}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.seperator} />}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  contentContainer: {
    paddingBottom: 50,
  },

  listContainer: {
    paddingVertical: 8,
    paddingBottom: 50,
  },

  seperator: {
    height: 8,
  },

  unselected: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  selected: {
    backgroundColor: "#4a90e2",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});

export default AddExercisesScreen;

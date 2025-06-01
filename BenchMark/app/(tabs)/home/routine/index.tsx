import { SafeAreaView, View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Exercise, RoutineParams } from "@/components/Types";
import auth from "@react-native-firebase/auth";
import { addDoc, collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";

const RoutineScreen = () => {
    const db = getFirestore();
    const router = useRouter();
    const params = useLocalSearchParams<RoutineParams>();
    const [routineName, setRoutineName] = useState<string>(params.routineName);
    const [description, setDescription] = useState<string>(params.description);
    const [exercises, setExercises] = useState<Exercise[]>(JSON.parse(params.exercises));
    const [inputs, setInputs] = useState<{[key: string]: {weight: string; reps: string};}>({});

    const updateSetValue = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: string) => {
        const key = `${exerciseIndex}-${setIndex}`;
        setInputs(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const addSet = (exerciseIndex: number) => {
        setExercises(prev => {
            const updated = [...prev];
            const exercise = {...updated[exerciseIndex]};
            const lastSet = exercise.sets[exercise.sets.length - 1];
            const newSet = {
                weight: lastSet?.weight || 0,
                reps: lastSet?.reps || 0
            }
            exercise.sets = [...exercise.sets, newSet];
            updated[exerciseIndex] = exercise;
            return updated;
        });
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        setExercises(prev => {
            const updated = [...prev];
            const exercise = {...updated[exerciseIndex]};
            if (exercise.sets.length > 1) {
                exercise.sets = exercise.sets.filter((_, index) => index != setIndex);
                updated[exerciseIndex] = exercise;
            }
            return updated;
        });

        const key = `${exerciseIndex}-${setIndex}`;
        setInputs(prev => {
            const updated = {...prev};
            delete updated[key];
            return updated;
        })
    };

    const addExercise = () => {
        router.push({
            pathname: "/home/routine/addExercise",
            params: {
                id: params.id,
                routineName: params.routineName,
                description: params.description,
                exercises: JSON.stringify(exercises)
            }
        })
    };

    const removeExercise = (exericseIndex: number) => {
        const updated = exercises.filter((_, index) => index != exericseIndex);
        setExercises(updated);
    };

    const saveRoutine = async () => {
        try {
            const updatedExercises = exercises.map((exercise, exerciseIndex) => ({
                ...exercise,
                sets: exercise.sets.map((set, setIndex) => {
                    const key = `${exerciseIndex}-${setIndex}`;
                    const inputValue = inputs[key] || {};
                    return {
                        weight: inputValue.weight ? Number(inputValue.weight) : set.weight,
                        reps: inputValue.reps ? Number(inputValue.reps) : set.reps
                    }
                })
            }));

            const uid = auth().currentUser?.uid;
            const docRef = await setDoc(doc(db, "users", uid, "myRoutines", params.id), {
                routineName: routineName,
                description: description,
                exercises: updatedExercises
            })
            router.replace('/(tabs)/home');
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("Save Routine Failed: " + err.message);
        }
    };

    const endWorkout = async () => {
        try {
            const updatedExercises = exercises.map((exercise, exerciseIndex) => ({
                ...exercise,
                sets: exercise.sets.map((set, setIndex) => {
                    const key = `${exerciseIndex}-${setIndex}`;
                    const inputValue = inputs[key] || {};
                    return {
                        weight: inputValue.weight ? Number(inputValue.weight) : set.weight,
                        reps: inputValue.reps ? Number(inputValue.reps) : set.reps
                    }
                })
            }));

            const uid = auth().currentUser?.uid;
            const docRef = await addDoc(collection(db, "users", uid, "myWorkouts"), {
                routineName: routineName,
                description: description,
                exercises: updatedExercises,
                date: new Date().toDateString()
            })
            router.replace('/(tabs)/home');
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("End Workout Failed: " + err.message);
        }
    }

    const renderExercise = ({item, index: exerciseIndex}: {item: Exercise, index: number}) => {
        return (
            <View style={styles.exerciseContainer}>
                <ThemedText type="subtitle">{item.exerciseName}</ThemedText>
                
                <View style={styles.gridRow}>
                    <ThemedText type="default" style={styles.gridColumn}>Sets</ThemedText>
                    <ThemedText type="default" style={styles.gridColumnWide}>Weight (kg)</ThemedText>
                    <ThemedText type="default" style={styles.gridColumnWide}>Reps</ThemedText>
                    <View style={styles.gridColumn}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => removeExercise(exerciseIndex)}>
                            <Text style={styles.deleteText}>-</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {item.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.gridRow}>
                        <ThemedText type="default" style={styles.gridColumn}>{setIndex + 1}</ThemedText>
                        <View style={styles.gridColumnWide}>
                            <TextInput
                                style={styles.input}
                                value={inputs.weight}
                                placeholder={set.weight.toString()}
                                onChangeText={(value: string) => updateSetValue(exerciseIndex, setIndex, "weight", value)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.gridColumnWide}>
                            <TextInput
                                style={styles.input}
                                value={inputs.reps}
                                placeholder={set.reps.toString()}
                                onChangeText={(value: string) => updateSetValue(exerciseIndex, setIndex, "reps", value)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.gridColumn}>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => removeSet(exerciseIndex, setIndex)}>
                                <Text style={styles.deleteText}>-</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={() => addSet(exerciseIndex)}>
                    <Text style={styles.addText}>Add Set</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
            </View>
        )
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TextInput
                    style={styles.title}
                    value={routineName}
                    placeholder={routineName}
                    onChangeText={setRoutineName}
                />
                {params.started === "true" ? (
                    <TouchableOpacity style={styles.headerButton} onPress={endWorkout}>
                        <Text style={styles.headerButtonText}>End Workout</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.headerButton} onPress={saveRoutine}>
                        <Text style={styles.headerButtonText}>Save Routine</Text>
                    </TouchableOpacity>
                )}
            </View>
            <TextInput
                style={styles.description}
                value={description}
                placeholder={description}
                onChangeText={setDescription}
                multiline={true}
            />
            <View style={styles.divider} />
            <FlatList
                data={exercises}
                renderItem={renderExercise}
                contentContainerStyle={{
                    paddingBottom: 50
                }}
                ListFooterComponent={
                    <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                        <Text style={styles.addText}>Add Exercises</Text>
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5,
        backgroundColor: "#FFF"
    },
    
    title: {
        fontSize: 32,
        fontWeight: "bold",
        flex: 1
    },

    description: {
        fontSize: 16,
        padding: 8
    },

    headerContainer: {
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    headerButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },

    headerButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    },
  
    exerciseContainer: {
      marginVertical: 8,
      paddingHorizontal: 4
    },

    gridRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
        gap: 8
    },

    gridColumn: {
        flex: 1,
        textAlign: "center"
    },

    gridColumnWide: {
        flex: 2,
        textAlign: "center"
    },

    input: {
        marginVertical: 8,
        height: 50,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#FFF",
        fontSize: 16
    },

    deleteButton: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff4444",
        borderRadius: 15,
        marginLeft: 5
    },

    deleteText: {
        color: "#000",
        fontSize: 20,
        fontWeight: "bold"
    },

    addButton: {
        backgroundColor: "#4a90e2",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center"
    },

    addText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 8
    }
});

export default RoutineScreen;
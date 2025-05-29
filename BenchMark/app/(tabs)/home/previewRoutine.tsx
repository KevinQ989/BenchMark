import { SafeAreaView, View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Set, Exercise, RoutineParams } from "@/components/Types";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";

const PreviewRoutineScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<RoutineParams>();
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
            await firestore().collection("users").doc(uid)
                .collection("myRoutines").doc(params.id)
                .update({exercises: updatedExercises});
            router.back();
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("Save Routine Failed: " + err.message);
        }
    };

    const renderExercise = ({item, index: exerciseIndex}: {item: Exercise, index: number}) => {
        return (
            <View style={styles.exerciseContainer}>
                <ThemedText type="subtitle">{item.exerciseName}</ThemedText>
                
                <View style={styles.gridRow}>
                    <ThemedText type="default" style={styles.gridColumn}>Sets</ThemedText>
                    <ThemedText type="default" style={styles.gridColumn}>Weight (kg)</ThemedText>
                    <ThemedText type="default" style={styles.gridColumn}>Reps</ThemedText>
                </View>

                {item.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.gridRow}>
                        <ThemedText type="default" style={styles.gridColumn}>{setIndex + 1}</ThemedText>
                        <View style={styles.gridColumn}>
                            <TextInput
                                style={styles.input}
                                value={inputs.weight}
                                placeholder={set.weight.toString()}
                                onChangeText={(value: string) => updateSetValue(exerciseIndex, setIndex, "weight", value)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.gridColumn}>
                            <TextInput
                                style={styles.input}
                                value={inputs.reps}
                                placeholder={set.reps.toString()}
                                onChangeText={(value: string) => updateSetValue(exerciseIndex, setIndex, "reps", value)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                ))}
            </View>
        )
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={exercises}
                    renderItem={renderExercise}
                    ListHeaderComponent={
                        <ThemedText type="title">{params.routineName}</ThemedText>
                    }
                    ListFooterComponent={
                        <TouchableOpacity style={styles.saveContainer} onPress={saveRoutine}>
                            <Text style={styles.saveText}>Save Routine</Text>
                        </TouchableOpacity>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5,
        backgroundColor: "#FFF"
    },
    
    contentContainer: {
        paddingBottom: 50
    },
  
    exerciseContainer: {
      marginVertical: 8,
      paddingHorizontal: 4
    },

    gridRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4
    },

    gridColumn: {
        flex: 1,
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

    saveContainer: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 16,
        marginVertical: 12,
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

    saveText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    }
});

export default PreviewRoutineScreen;
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { FirebaseError } from "firebase/app";
import { ExerciseInfo} from "@/components/Types";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

const ExercisesScreen = () => {
    const [allExercises, setAllExercises] = useState<ExerciseInfo[]>([]);
    const [target, setTarget] = useState<String[]>([]);
    const [equipment, setEquipment] = useState<String[]>([]);
    const [selected, setSelected] = useState<ExerciseInfo[]>([]);

    const fetchExercises = async () => {
        try {
            const exerciseData = await firestore().collection("exercises").get();
            const exercises = exerciseData.docs.map(doc => {
                const data = doc.data();
                return {
                    exerciseName: data.exerciseName,
                    target: data.target,
                    subTarget: data.subTarget,
                    equipment: data.equipment 
                }
            });
            setAllExercises(exercises);
            setSelected(exercises);
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("Fetch Exercises Failed: " + err.message);
        }
    };

    const filterExercises = () => {
        const filtered = allExercises.filter((exercise) => 
            (target.length === 0 || target.includes(exercise.target) || target.includes(exercise.subTarget) )&&
            (equipment.length === 0 || equipment.includes(exercise.equipment))
        );
        const sorted = filtered.sort((x, y) => x.exerciseName.localeCompare(y.exerciseName))
        setSelected(sorted)
    };

    const renderExercise = ({item}: {item: ExerciseInfo}) => {
        return (
            <View>
                <Text>{item.exerciseName}</Text>
            </View>
        )
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [target, equipment, allExercises]);

    return (
        <SafeAreaView>
            <View style={styles.listHeader}>
                <TouchableOpacity style={styles.listButtons}>
                    <ThemedText type="subtitle">Add Exercise</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.listButtons}>
                    <ThemedText type="subtitle">Filter</ThemedText>
                </TouchableOpacity>
            </View>
            <FlatList
                data={selected}
                renderItem={renderExercise}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    listHeader: {
        backgroundColor: "#808080",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    listButtons: {
        padding: 10
    }
});

export default ExercisesScreen;


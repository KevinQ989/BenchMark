import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { FirebaseError } from "firebase/app";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ExerciseInfo} from "@/components/Types";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

const ExercisesScreen = () => {
    const router = useRouter();
    const filterParams = useLocalSearchParams();
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

    const renderExercise = ({item}: {item: ExerciseInfo}) => {
        return (
            <TouchableOpacity 
                style={styles.exerciseItem}
                onPress={() => router.push({
                    pathname: '/exercises/previewExercise',
                    params: {
                        exerciseName: item.exerciseName,
                        target: item.target,
                        subTarget: item.subTarget,
                        equipment: item.equipment
                    }
                })}
            >
                <Text style={styles.exerciseName}>{item.exerciseName}</Text>
            </TouchableOpacity>
        )
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        setTarget(filterParams.selectedTargets ? JSON.parse(filterParams.selectedTargets) : []);
        setEquipment(filterParams.selectedEquipment ? JSON.parse(filterParams.selectedEquipment) : []);
    }, [filterParams.selectedTargets, filterParams.selectedEquipment]);

    useEffect(() => {
        const filtered = allExercises.filter((exercise) => 
            (target.length === 0 || target.includes(exercise.target) || target.includes(exercise.subTarget)) &&
            (equipment.length === 0 || equipment.includes(exercise.equipment))
        );
        const sorted = filtered.sort((x, y) => x.exerciseName.localeCompare(y.exerciseName));
        setSelected(sorted);
    }, [target, equipment, allExercises])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.listHeader}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/exercises/newExercise')}>
                    <Text style={styles.headerButtonText}>Add Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/exercises/filterExercise')}>
                    <Text style={styles.headerButtonText}>Filter</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={selected}
                renderItem={renderExercise}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.seperator} />}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },

    listHeader: {
        backgroundColor: "#4a90e2",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },

    headerButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20
    },
    
    headerButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600"
    },

    listContainer: {
        paddingVertical: 8,
        paddingBottom: 50
    },

    seperator: {
        height: 8
    },

    exerciseItem: {
        backgroundColor: "#fff",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41
    },

    exerciseName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    }
});

export default ExercisesScreen;


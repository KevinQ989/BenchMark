import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert  } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { addDoc, collection, getFirestore } from "@react-native-firebase/firestore";

const NewExercisesScreen = () => {
    const db = getFirestore();
    const [exerciseName, setExerciseName] = useState<string>('');
    const [target, setTarget] = useState<string>('');
    const [subTarget, setSubTarget] = useState<string>('');
    const [equipment, setEquipment] = useState<string>('');

    const addExercise = async () => {
        if (exerciseName === '') {
            Alert.alert("Failed", "Exercise must have a name");
        } else if (target === '') {
            Alert.alert("Failed", "Exercise must have a target");
        } else if (equipment === '') {
            Alert.alert("Failed", "Exercise must have an equipment")
        } else {
            try {
                const newExercise = {
                    exerciseName: exerciseName,
                    target: target,
                    subTarget: subTarget,
                    equipment: equipment
                }
                const docRef = await addDoc(collection(db, "exercises"), newExercise);
                setExerciseName('');
                setTarget('');
                setSubTarget('');
                setEquipment('');
                Alert.alert("Success", "Exercise Added Succesfully");
            } catch (e: any) {
                const err = e as FirebaseError;
                alert("Add Exercise Failed: " + err.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle" style={styles.label}>Exercise Name: </ThemedText>
                    <TextInput
                        style={styles.input}
                        value={exerciseName}
                        onChangeText={setExerciseName}
                        placeholder="Exercise Name"
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle" style={styles.label}>Target: </ThemedText>
                    <TextInput
                        style={styles.input}
                        value={target}
                        onChangeText={setTarget}
                        placeholder="Target"
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle" style={styles.label}>Sub-Target: </ThemedText>
                    <TextInput
                        style={styles.input}
                        value={subTarget}
                        onChangeText={setSubTarget}
                        placeholder="Sub-Target"
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle" style={styles.label}>Equipment: </ThemedText>
                    <TextInput
                        style={styles.input}
                        value={equipment}
                        onChangeText={setEquipment}
                        placeholder="Equipment"
                    />
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={addExercise}>
                    <Text style={styles.submitText}>Add Exercise</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },

    fieldContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20
    },

    label: {
        fontSize: 16,
        fontWeight: "600"
    },

    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd"
    },

    submitButton: {
        backgroundColor: "#4a90e2",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 10
    },

    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});

export default NewExercisesScreen;
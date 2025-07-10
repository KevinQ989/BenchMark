import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { addExercise } from "@/utils/firestoreSaveUtils";

const NewExercisesScreen = () => {
    const [exerciseName, setExerciseName] = useState<string>('');
    const [target, setTarget] = useState<string | null>(null);
    const [subTarget, setSubTarget] = useState<string | null>(null);
    const [equipment, setEquipment] = useState<string | null>(null);

    const targets = new Map<string, string[]>();
    targets.set("Chest", ["Upper Pectorals", "Lower Pectorals"]);
    targets.set("Back", ["Lats", "Rhomboids", "Trapezius", "Rear Deltoids"]);
    targets.set("Arms", ["Biceps", "Triceps"]);
    targets.set("Shoulders", ["Front Deltoids", "Side Deltoids"]);
    targets.set("Legs", ["Glutes", "Hamstrings", "Quadriceps", "Calves"]);
    targets.set("Core", ["Upper Abs", "Lower Abs", "Obliques"]);
    const equipments : string[] = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

    const handleAdd = async () => {
        if (exerciseName === '') {
            Alert.alert("Failed", "Exercise must have a name");
        } else if (target === null) {
            Alert.alert("Failed", "Exercise must have a target");
        } else if (equipment === null) {
            Alert.alert("Failed", "Exercise must have an equipment")
        } else {
            const success = await addExercise(exerciseName, target, subTarget, equipment);
            if (success) {
                setExerciseName('');
                setTarget(null);
                setSubTarget(null);
                setEquipment(null);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Add Exercise</Text>
            <View style={styles.content}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Exercise Name</Text>
                    <TextInput
                        style={styles.textInput}
                        value={exerciseName}
                        onChangeText={setExerciseName}
                        placeholder="Set Exercise Name"
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Target</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={target}
                            onValueChange={(itemValue) => {
                                setTarget(itemValue);
                                setSubTarget(null);
                            }}
                        >
                            <Picker.Item key={0} label={"Select Target"} value={null} />
                            {[...targets.keys()].map((item: string, index: number) => (
                                <Picker.Item key={index} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Sub-Target</Text>
                    <View style={styles.picker}>
                        {target ? (
                            <Picker
                                selectedValue={subTarget}
                                onValueChange={(itemValue) => setSubTarget(itemValue)}
                            >
                                <Picker.Item key={0} label={"Select Sub-Target"} value={null} />
                                {(targets.get(target) ?? []).map((item: string, index: number) => (
                                    <Picker.Item key={index} label={item} value={item} />
                                ))}
                            </Picker>
                        ) : (
                            <Text style={styles.textInput}>Select Target First</Text>
                        )}
                    </View>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Equipment</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={equipment}
                            onValueChange={(itemValue) => setEquipment(itemValue)}
                        >
                            <Picker.Item key={0} label={"Select Equipment"} value={null} />
                            {equipments.map((item: string, index: number) => (
                                <Picker.Item key={index + 1} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <TouchableOpacity style={styles.buttonContainer} onPress={handleAdd}>
                    <Text style={styles.buttonText}>Add 1RM</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFF"
    },

    title: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        color: "#212529",
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E9ECEF"
    },

    content: {
        flex: 1,
        padding: 20
    },

    fieldContainer: {
        marginBottom: 32
    },

    fieldLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#495057",
        marginBottom: 12,
        letterSpacing: 0.5
    },

    picker: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DEE2E6",
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 56,
        justifyContent: "center",
        overflow: "hidden"
    },

    textInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DEE2E6",
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#212529",
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 56
    },

    buttonContainer: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 40,
        shadowColor: "#007AFF",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: 0.5
    }
});

export default NewExercisesScreen;
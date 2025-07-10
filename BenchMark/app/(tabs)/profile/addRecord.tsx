import { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchExercises } from "@/utils/firestoreFetchUtils";
import { ExerciseInfo } from "@/constants/Types";
import { saveRecord } from "@/utils/firestoreSaveUtils";

const AddRecordScreen = () => {
    const [catalog, setCatalog] = useState<string[]>([]);
    const [exercise, setExercise] = useState<string>('');
    const [weight, setWeight] = useState<number>(0);
    const [date, setDate] = useState<Date>(new Date());

    const fetchExerciseCatalog = async () => {
        const exercises: ExerciseInfo[] = await fetchExercises();
        const exerciseCatalog: string[] = exercises.map((item: ExerciseInfo) => item.exerciseName);
        setCatalog(exerciseCatalog);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSaveRecord = async () => {
        if (!exercise) {
            Alert.alert("Add 1RM Failed", "No Exercise Selected")
        } else {
            await saveRecord(exercise, date, weight);
            setExercise('');
            setWeight(0);
            setDate(new Date());
        }
    };

    useEffect(() => {
        fetchExerciseCatalog();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Add 1RM</Text>
            <View style={styles.content}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Exercise</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={exercise}
                            onValueChange={(itemValue) => setExercise(itemValue)}
                        >
                            <Picker.Item key={0} label={"Select Exercise"} value={null} />
                            {catalog.map((item: string, index: number) => (
                                <Picker.Item key={index} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Weight</Text>
                    <TextInput
                        style={styles.textInput}
                        value={weight.toLocaleString()}
                        onChangeText={(text) => setWeight(Number(text))}
                        placeholder="Enter Weight"
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Date</Text>
                    <View style={styles.datePickerContainer}>
                        <DateTimePicker
                            style={styles.datePicker}
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.buttonContainer} onPress={handleSaveRecord}>
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

    datePickerContainer: {
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
        paddingHorizontal: 8
    },

    datePicker: {
        height: 40,
        width: "100%"
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

export default AddRecordScreen;
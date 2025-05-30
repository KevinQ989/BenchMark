import { View, StyleSheet  } from "react-native";
import { ExerciseInfo } from "@/components/Types";
import { ThemedText } from "@/components/ThemedText";
import { useState } from "react";

const FilterExercisesScreen = () => {
    const [exerciseName, setExerciseName] = useState<string>('');
    const [target, setTarget] = useState<string>('');
    const [subTarget, setSubTarget] = useState<string>('');
    const [equipment, setEquipment] = useState<string>('');

    return (
        <View style={styles.container}>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFF"
    }
});

export default FilterExercisesScreen;
import { View, Text, StyleSheet  } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ExerciseInfo } from "@/components/Types";

const PreviewExercisesScreen = () => {
    const params = useLocalSearchParams<ExerciseInfo>();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{params.exerciseName}</Text>
                <View style={styles.info}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Equipment</Text>
                        <Text style={styles.value}>{params.equipment}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Target</Text>
                        <Text style={styles.value}>{params.target}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Sub-Target</Text>
                        <Text style={styles.value}>{params.subTarget}</Text>
                    </View>
                </View>
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

    info: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 16
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12
    },
    
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1
    },
    
    value: {
        fontSize: 16,
        fontWeight: "600",
        flex: 2,
        textAlign: "right"
    },
    
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 8
    }
});

export default PreviewExercisesScreen;
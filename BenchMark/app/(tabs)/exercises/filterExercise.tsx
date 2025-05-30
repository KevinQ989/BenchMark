import { View, ScrollView, TouchableOpacity, Text, StyleSheet  } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";

const FilterExercisesScreen = () => {
    const router = useRouter();
    const [selectedTargets, setSelectedTargets] = useState<String[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<String[]>([]);

    const targets = ["Legs", "Chest", "Back", "Shoulders", "Arms", "Core"];
    const equipment = ["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"];

    const toggleTarget = (item: String) => {
        setSelectedTargets(prev => 
            prev.includes(item) ?
            prev.filter(x => x != item) :
            [...prev, item]
        );
    };

    const toggleEquipment = (item: String) => {
        setSelectedEquipment(prev => 
            prev.includes(item) ?
            prev.filter(x => x != item) :
            [...prev, item]
        );
    };

    const applyFilters = () => {
        router.replace({
            pathname: "/exercises",
            params: {
                selectedTargets: JSON.stringify(selectedTargets),
                selectedEquipment: JSON.stringify(selectedEquipment)
            }
        })
    };

    const CheckboxItem = ({
        label,
        isChecked,
        onToggle
    } : {
        label: String,
        isChecked: Boolean,
        onToggle: () => void
    }) => (
        <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={onToggle}
        >
            <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={onToggle}
                color={isChecked ? "#4a90e2" : undefined}
            />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Target Muscle Groups</Text>
                    {targets.map(target => (
                        <CheckboxItem
                            key={target}
                            label={target}
                            isChecked={selectedTargets.includes(target)}
                            onToggle={() => toggleTarget(target)}
                        />
                    ))}
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Equipment</Text>
                    {equipment.map(target => (
                        <CheckboxItem
                            key={target}
                            label={target}
                            isChecked={selectedEquipment.includes(target)}
                            onToggle={() => toggleEquipment(target)}
                        />
                    ))}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setSelectedEquipment([]);
                            setSelectedTargets([]);
                        }}
                    >
                        <Text style={styles.buttonText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={applyFilters}
                    >
                        <Text style={styles.buttonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },

    section: {
        marginBottom: 24
    },

    sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8
    },

    checkbox: {
        margin: 8
    },

    checkboxLabel: {
        fontSize: 16,
        marginLeft: 8
    },

    buttonContainer: {
        padding: 16,
        backgroundColor: "#000",
        flexDirection: "row",
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee"
    },

    clearButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        alignItems: "center"
    },

    applyButton: {
        flex: 2,
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#4a90e2",
        alignItems: "center"
    },

    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600"
    }
});

export default FilterExercisesScreen;
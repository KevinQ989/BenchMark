import { 
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import auth from "@react-native-firebase/auth";
import React, { useCallback, useState } from "react";
import { Metric, RepMax, UserData } from "@/constants/Types";
import { useFocusEffect, useRouter } from "expo-router";
import { BarChart } from "react-native-gifted-charts";
import {
    toBarData,
    getMax,
    formatDuration
} from "@/utils/profileUtils";
import { fetchHistory, fetchRecords, fetchUserData } from "@/utils/firestoreFetchUtils";
import { saveGoal } from "@/utils/firestoreSaveUtils";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ProfileScreen = () => {
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [records, setRecords] = useState<RepMax[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
    const [goal, setGoal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    
    const fetchData = async () => {
        setLoading(true);
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        const userData: UserData | undefined = await fetchUserData(uid);
        if (userData) {
            setUsername(userData.username);
            setPhotoURL(userData.photoURL ?? null);
            setGoal(userData.goal);
            setMetrics([
                {
                    metric: "Total Workouts",
                    value: userData.workouts.toLocaleString()
                },
                {
                    metric: "Total Workout\nDuration",
                    value: formatDuration(userData.duration)
                },
                {
                    metric: "Average Workout\nDuration",
                    value: formatDuration(userData.workouts != 0 ? userData.duration / userData.workouts : 0)
                }
            ])
        }
        setLoading(false);

        const repmaxs: RepMax[] | undefined = await fetchRecords();
        if (repmaxs) setRecords(repmaxs);

        const history = await fetchHistory();
        if (history) {
            const dates: Date[] = history.map(item => item.date);
            setWorkoutDates(dates);
        }
    };

    const renderMetric = ({item} : {item: Metric}) => {
        return (
            <View style={styles.card}>
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardName}>{item.metric}</Text>
            </View>
        );
    };

    const renderRepMax = ({item} : {item: RepMax}) => {
        const last = item.history
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const date = last.date.toLocaleDateString();
        return (
            <TouchableOpacity style={styles.card} onPress={() => router.push({
                pathname: "/(tabs)/profile/viewRecord",
                params: {
                    exercise: item.exercise,
                    historyString: JSON.stringify(item.history.map(record => ({
                        date: record.date.toISOString(),
                        weight: record.weight
                    })))
                }
            })}>
                <Text style={styles.cardValue}>{last.weight}kg</Text>
                <Text style={styles.cardDate}>{date}</Text>
                <Text style={styles.cardName}>{item.exercise}</Text>
            </TouchableOpacity>
        );
    };

    const handleSaveGoal = async () => {
        await saveGoal(goal);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 50}}>
                <View style={styles.titleContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color={"#430589"}/>
                    ) : photoURL ? (
                        <Image
                            source={{ uri: photoURL }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <MaterialIcons size={28} name="person" color={"#430589"} />
                    )}
                    <Text style={styles.title}>{username}</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/profile/editProfile")}>
                        <MaterialIcons size={28} name="settings" color={"#430589"} />
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />

                <View style={styles.subContainer}>
                    <Text style={styles.subtitle}>Key Metrics</Text>
                    <FlatList
                        data={metrics}
                        renderItem={renderMetric}
                        horizontal={true}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }}/>
                        )}
                    />
                </View>
                <View style={styles.divider} />

                <View style={styles.subContainer}>
                    <Text style={styles.subtitle}>Personal Records</Text>
                    <FlatList
                        data={records}
                        renderItem={renderRepMax}
                        horizontal={true}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }}/>
                        )}
                    />
                    <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/(tabs)/profile/addRecord")}>
                        <Text style={styles.buttonText}>Add Record</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />

                <View style={styles.subContainer}>
                    <Text style={styles.subtitle}>Weekly Workout Goal</Text>
                    <View style={styles.subContainer}>
                        <BarChart
                            data={toBarData(workoutDates, new Date())}
                            barWidth={22}
                            barBorderRadius={4}
                            frontColor="#177AD5"
                            stepValue={1}
                            maxValue={getMax(toBarData(workoutDates, new Date()), goal) + 1}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            rotateLabel
                            xAxisLabelTextStyle={{
                                color: '#666',
                                fontSize: 10,
                                fontWeight: '400',
                            }}
                            yAxisTextStyle={{
                                color: '#666',
                                fontSize: 12,
                            }}
                            referenceLine1Position={goal}
                            referenceLine1Config={{
                                color: '#FF6B6B',
                                dashWidth: 5,
                                dashGap: 5,
                                thickness: 2
                            }}
                            showReferenceLine1
                            disablePress
                            disableScroll
                        />
                    </View>
                    <View style={styles.goalContainer}>
                        <TextInput
                            style={styles.goalText}
                            value={goal.toLocaleString()}
                            onChangeText={(val) => setGoal(Number(val))}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.buttonContainer} onPress={handleSaveGoal}>
                            <Text style={styles.buttonText}>Set Goal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.divider} />
            </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16
    },

    profilePhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0"
    },

    title: {
        fontSize: 28,
        fontWeight: "bold"
    },
    
    subContainer: {
      gap: 8,
      marginBottom: 8,
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 10
    },

    subtitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10
    },

    card: {
        borderRadius: 15,
        backgroundColor: "#4a9e02",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        gap: 8,
        minWidth: 120,
        minHeight: 100
    },

    cardName: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        color: "#000",
        lineHeight: 18
    },

    cardValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center"
    },

    cardDate: {
        fontSize: 11,
        fontWeight: "400",
        textAlign: "center",
        color: "#333",
        lineHeight: 14,
        marginTop: 2
    },
    
    buttonContainer: {
        backgroundColor: "#cccccc",
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 40,
        marginTop: 16
    },

    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: 0.5
    },

    divider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 10
    },

    goalContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20
    },

    goalText: {
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "#4a9e02",
        borderRadius: 10,
        padding: 10,
        marginTop: 16
    }
});

export default ProfileScreen;
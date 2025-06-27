import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useCallback, useState } from "react";
import { Metric, RepMax } from "@/constants/Types";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { BarChart, barDataItem } from "react-native-gifted-charts";

const ProfileScreen = () => {
    const db = getFirestore();
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [records, setRecords] = useState<RepMax[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
    const [goal, setGoal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const uid = auth().currentUser?.uid;
            if (uid) {
                const docSnap = await getDoc(doc(db, "users", uid));
                const data = docSnap.data();
                if (data) {
                    setUsername(data.username);
                    setPhotoURL(data.photoURL);
                    fetchMetrics(data.metrics);
                }
            } else {
                Alert.alert("Fetch User Data Failed", "No User Logged In");
            }
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch User Data Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = (map: { [key: string]: number } | undefined) => {
        let workouts;
        let duration;
        let goal;
        if (map) {
            workouts = map.workouts ?? 0;
            duration = map.duration ?? 0;
            goal = map.goal ?? 0;
        } else {
            workouts = 0;
            duration = 0;
            goal = 0;
        }
        setGoal(goal);
        setMetrics([
            {
                metric: "Total Workouts",
                value: workouts.toLocaleString()
            },
            {
                metric: "Total Workout\nDuration",
                value: formatDuration(duration)
            },
            {
                metric: "Average Workout\nDuration",
                value: formatDuration(workouts != 0 ? duration / workouts : 0)
            }
        ])
    };

    const fetchWorkoutDates = async () => {
        try {
            const uid = auth().currentUser?.uid;
            if (uid) {
                const querySnapshot = await getDocs(collection(db, "users", uid, "myWorkouts"))
                let dates: Date[] = [];
                querySnapshot.forEach((doc) => {
                    const date = doc.data().date.toDate();
                    dates.push(date);
                });
                setWorkoutDates(dates);
            } else {
                Alert.alert("Fetch Workout Dates Failed", "No User Logged In");
            }
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch Workout Dates Failed", err.message);
        }
    };

    const fetchRecords = async () => {
        try {
            const uid = auth().currentUser?.uid;
            if (uid) {
                const querySnapshot = await getDocs(collection(db, "users", uid, "repmax"))
                const repmaxs: RepMax[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        exercise: data.exercise,
                        history: data.history.map((record: any) => ({
                            date: record.date.toDate(),
                            weight: record.weight
                        }))
                    };
                });
                setRecords(repmaxs);
            } else {
                Alert.alert("Fetch Records Failed", "No User Logged In");
            }
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch Records Failed", err.message);
        }
    };

    const toMarkedDates = (dates: Date[]) => {
        const markedDates: MarkedDates = {};
        dates.forEach((date: Date) => {
            const dateString = date.toISOString().split("T")[0];
            markedDates[dateString] = {
                marked: true,
                dotColor: "#4CAF50",
                activeOpacity: 0.8
            };

        });
        return markedDates;
    };

    const toBarData = (dates: Date[]) => {
        const weeklyCount = new Map<string, { count: number, date: Date }>();

        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const dateKey = new Date(today);
            dateKey.setDate(today.getDate() - today.getDay() - (7 * i));
            const stringKey = dateKey.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short"
            });
            weeklyCount.set(stringKey, { count: 0, date: dateKey });
        };

        dates.forEach((date: Date) => {
            const dateKey = new Date(date);
            dateKey.setDate(dateKey.getDate() - dateKey.getDay());
            const stringKey = dateKey.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short"
            });
            if (weeklyCount.has(stringKey)) {
                const current = weeklyCount.get(stringKey) || { count: 0, date: dateKey };
                weeklyCount.set(stringKey, { count: current.count + 1, date: dateKey });
            }
        });

        const barData: barDataItem[] = Array.from(weeklyCount.entries())
            .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
            .map(([key, data]) => {
                return {
                    value: data.count,
                    label: key
                }
            });
        return barData;
    };

    const getMax = (barDataItems: barDataItem[]) => {
        let count: number[] = [];
        barDataItems.forEach((item: barDataItem) => {
            count.push(item.value || 0)
        });
        return Math.max(...count, goal);
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
    }

    const saveGoal = async () => {
        try {
            const uid = auth().currentUser?.uid;
            if (uid) {
                const db = getFirestore();
                const docRef = doc(db, "users", uid);
                await updateDoc(docRef, {
                    ["metrics.goal"]: Math.min(Math.max(0, goal), 7)
                });
                Alert.alert("Success", `Weekly workout goal set at ${goal}`)
            } else {
                Alert.alert("Set Goal Failed", "No User Logged In");
            }
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Set Goal Failed", err.message);
        }
    };

    const formatDuration = (n: number) => {
        const totalSeconds = Math.floor(n);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60)
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
            fetchWorkoutDates();
            fetchRecords();
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
                        <IconSymbol size={28} name="person.fill" color={"#430589"} />
                    )}
                    <Text style={styles.title}>{username}</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/profile/editProfile")}>
                        <IconSymbol size={28} name="gearshape.fill" color={"#430954"} />
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
                            data={toBarData(workoutDates)}
                            barWidth={22}
                            barBorderRadius={4}
                            frontColor="#177AD5"
                            stepValue={1}
                            maxValue={getMax(toBarData(workoutDates)) + 1}
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
                        <TouchableOpacity style={styles.buttonContainer} onPress={saveGoal}>
                            <Text style={styles.buttonText}>Set Goal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.subContainer}>
                    <Text style={styles.subtitle}>Workout Dates</Text>
                    <Calendar
                        markedDates={toMarkedDates(workoutDates)}
                    />
                </View>
                <View style={styles.divider} />
            </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFF"
    },
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
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
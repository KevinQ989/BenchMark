import { Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { Metric } from "@/components/Types";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { BarChart, barDataItem } from "react-native-gifted-charts";

const ProfileScreen = () => {
    const db = getFirestore();
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    
    const fetchUserData = async () => {
        try {
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
        }
    };

    const fetchMetrics = (map: { [key: string]: number } | undefined) => {
        let workouts;
        let duration;
        if (map) {
            workouts = map.workouts ?? 0;
            duration = map.duration ?? 0;
        } else {
            workouts = 0;
            duration = 0;
        }
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
                value: formatDuration(duration / workouts)
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
    }

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
        return Math.max(...count);
    };

    const renderMetric = ({item} : {item: Metric}) => {
        return (
            <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{item.value}</Text>
                <Text style={styles.metricInfo}>{item.metric}</Text>
            </View>
        );
    };

    const formatDuration = (n: number) => {
        const totalSeconds = Math.floor(n);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60)
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        fetchUserData();
        fetchWorkoutDates();
    }, []);
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 50}}>
                <View style={styles.titleContainer}>
                    {photoURL ? (
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
                    <Text style={styles.subtitle}>Goal Tracking</Text>
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
                            disablePress
                            disableScroll
                        />
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.subContainer}>
                    <Text style={styles.subtitle}>Workout Dates</Text>
                    <Calendar
                        style={styles.calendar}
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

    metricCard: {
        borderRadius: 15,
        backgroundColor: "#4a9e02",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        gap: 8,
        minWidth: 120,
        minHeight: 100
    },

    metricInfo: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        color: "#000",
        lineHeight: 18
    },

    metricValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center"
    },

    calendar: {
    },

    divider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 10
    }
});

export default ProfileScreen;
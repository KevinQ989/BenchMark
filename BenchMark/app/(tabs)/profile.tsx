import { Alert, Button, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { Metric, WorkoutRecord } from "@/components/Types";


const ProfileScreen = () => {
    const db = getFirestore();
    const [username, setUsername] = useState<String>('');
    const [history, setHistory] = useState<WorkoutRecord[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [records, setRecords] = useState<Metric[]>([]);
    
    const fetchUsername = async () => {
        try {
            const uid = auth().currentUser?.uid;
            const userData = await getDoc(doc(db, "users", uid));
            setUsername(userData.data().username);
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch Username Failed", err.message);
        }
    };

    const fetchHistory = async () => {
        try {
            const uid = auth().currentUser?.uid;
            const querySnapshot = await getDocs(collection(db, "users", uid, "myWorkouts"));
            const history = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const exercises = data.exercises.map((exercise: any, exerciseIndex: number) => {
                    const sets = exercise.sets.map((set: any, setIndex: number) => ({
                        setNum: setIndex + 1,
                        weight: set.weight,
                        reps: set.reps,
                    }));

                    return {
                        exerciseName: exercise.exerciseName,
                        sets: sets
                    };
                });

                return {
                    id: doc.id,
                    routineName: data.routineName,
                    description: data.description,
                    exercises: exercises,
                    date: data.date.toDate(),
                    duration: data.duration
                }
            });
            setHistory(history);
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Fetch History Failed:", err.message);
        }
    };

    const calculateMetrics = () => {
        const workouts = {
            metric: "Total Workouts",
            value: history.length
        };
        const totalDuration = {
            metric: "Total Workout Duration",
            value: history.map((val) => val.duration).reduce((x, y) => x + y, 0)
        };
        const avgDuration = {
            metric: "Average Workout Duration",
            value: totalDuration.value / workouts.value
        };
        setMetrics([workouts, totalDuration, avgDuration]);
    };

    const calculateRecords = () => {
        const bench = {
            metric: "Bench Press",
            value: 0
        };
        const squat = {
            metric: "Squat",
            value: 0
        };
        const deadlift = {
            metric: "Deadlift",
            value: 0
        };
        const overhead = {
            metric: "Overhead Press",
            value: 0
        };
        setRecords([bench, squat, deadlift, overhead]);
    };

    const renderMetric = ({item} : {item: Metric}) => {
        return (
            <View style={styles.metricCard}>
                <Text style={styles.metricInfo}>{item.value}</Text>
                <Text style={styles.metricInfo}>{item.metric}</Text>
            </View>
        );
    };

    useEffect(() => {
        fetchUsername();
        fetchHistory();
        calculateMetrics();
        calculateRecords();
    }, []);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <ThemedText type="title">Welcome {username}</ThemedText>
                <HelloWave />
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
                <Button title="Sign Out" onPress={() => auth().signOut()} />
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
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    
    subContainer: {
      gap: 8,
      marginBottom: 8,
      alignItems: "center",
      paddingVertical: 20
    },

    subtitle: {
        fontSize: 24,
        fontWeight: "bold"
    },

    metricCard: {
        borderRadius: 15,
        backgroundColor: "#4a9e02",
        alignItems: "center",
        padding: 10
    },

    metricInfo: {
        fontSize: 16,
        fontWeight: "500"
    },

    divider: {
        height: 1,
        borderWidth: 1,
        borderColor: "#ddd"
    }
});

export default ProfileScreen;
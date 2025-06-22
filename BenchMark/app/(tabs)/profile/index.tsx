import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { Metric, WorkoutRecord } from "@/components/Types";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";


const ProfileScreen = () => {
    const db = getFirestore();
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
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
                metric: "Total Workout Duration",
                value: formatDuration(duration)
            },
            {
                metric: "Average Workout Duration",
                value: formatDuration(duration / workouts)
            }
        ])
    };

    const renderMetric = ({item} : {item: Metric}) => {
        return (
            <View style={styles.metricCard}>
                <Text style={styles.metricInfo}>{item.value}</Text>
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
    }, []);
    
    return (
        <SafeAreaView style={styles.container}>
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
                <Text style={styles.subtitle}>Workout Dates</Text>
            </View>
            <View style={styles.divider} />
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

    },

    title: {
        fontSize: 28,
        fontWeight: "bold"
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
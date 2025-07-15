import { useEffect, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { Friend, UserData } from "@/constants/Types";
import { fetchFriends, fetchUserData } from "@/utils/firestoreFetchUtils";
import Checkbox from "expo-checkbox";
import auth from "@react-native-firebase/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { shareRoutine } from "@/utils/firestoreSaveUtils";

const ShareRoutineScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    
    const handleFetchFriends = async () => {
        const friends: Friend[] | undefined = await fetchFriends();
        setFriends(friends ?? []);
    };

    const handleShareRoutine = async () => {
        const uid = auth().currentUser?.uid;
        if (!uid) return;
        const userData: UserData = await fetchUserData(uid);
        const success = await shareRoutine(
            `${userData.username}'s ${params.routineName}`,
            `Shared on ${new Date().toDateString()}`,
            JSON.parse(params.exercises as string),
            selected
        );
        if (success) {
            router.replace("/(tabs)/home")
        }
    };

    const toggleSelected = (uid: string) => {
        setSelected(prev => 
            prev.includes(uid) ?
            prev.filter(x => x != uid) :
            [...prev, uid]
        );
    };

    const renderItem = ({item} : {item: Friend}) => {
        const isSelected = selected.includes(item.uid);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => toggleSelected(item.uid)}
                activeOpacity={0.7}
            >
                <Checkbox
                    style={styles.checkbox}
                    value={isSelected}
                    onValueChange={() => toggleSelected(item.uid)}
                    color={isSelected ? "#4a90e2" : undefined}
                />
                <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
        )
    };

    useEffect(() => {
        handleFetchFriends();
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={friends}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You have no friends to share with.</Text>
                    </View>
                }
            />
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareRoutine}
                >
                    <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },

    listContainer: {
        paddingVertical: 10
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginVertical: 5,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },

    checkbox: {
        marginRight: 16,
        width: 24,
        height: 24,
        borderRadius: 6
    },

    username: {
        fontSize: 18,
        fontWeight: "500",
        color: "#444"
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100
    },

    emptyText: {
        fontSize: 16,
        color: "#888"
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        backgroundColor: "#fff"
    },

    shareButton: {
        flex: 1,
        backgroundColor: "#4a90e2",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginLeft: 8,
        elevation: 2
    },

    shareText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    }
});

export default ShareRoutineScreen;
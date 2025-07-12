import {
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import { UserData } from "@/constants/Types";
import { formatDuration } from "@/utils/profileUtils";

const LeaderboardItem = ({
    item,
    index,
    metric
}: {
    item: UserData,
    index: number,
    metric: 'Workouts' | 'Duration'
}) => {
    return (
        <View style={styles.itemContainer}>
            <View style={[
                styles.rankContainer,
                index === 0 && styles.rankGold,
                index === 1 && styles.rankSilver,
                index === 2 && styles.rankBronze
            ]}>
                <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <Text style={styles.usernameText}>{item.username}</Text>
            {metric == 'Duration' ? (
                <Text style={styles.metricText}>{formatDuration(item.duration)}</Text>
            ) : (
                <Text style={styles.metricText}>{item.workouts}</Text>
            )}
        </View>
    )
};

export const Leaderboard = ({
    data,
    metric
}: {
    data: UserData[],
    metric: 'Workouts' | 'Duration'
}) => {
    const sortData = (data: UserData[], metric: 'Workouts' | 'Duration') => {
        if (metric === 'Workouts') {
            return data.sort((a: UserData, b: UserData) => b.workouts - a.workouts);
        } else {
            return data.sort((a: UserData, b: UserData) => b.duration - a.duration);
        }
    };

    return (
        <FlatList
            data={sortData(data, metric)}
            renderItem={({item, index}) => (
                <LeaderboardItem item={item} index={index} metric={metric} />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            contentContainerStyle={styles.listContainer}
        />
    )
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },

    rankContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e0e0e0",
        marginRight: 16
    },

    rankGold: {
        backgroundColor: "#FFD700"
    },

    rankSilver: {
        backgroundColor: "#C0C0C0"
    },

    rankBronze: {
        backgroundColor: "#CD7F32"
    },

    rankText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff"
    },

    usernameText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#333"
    },

    metricText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4a90e2",
        minWidth: 60,
        textAlign: "right"
    },

    itemSeparator: {
        height: 10
    },

    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10
    }
});
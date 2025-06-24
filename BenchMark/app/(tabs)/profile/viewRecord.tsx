import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Record, RecordParams } from "@/components/Types";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

const ViewRecordScreen = () => {
    const params = useLocalSearchParams();
    const exercise = params.exercise;
    const history = JSON.parse(params.historyString as string).map((record: RecordParams) => ({
        date: new Date(record.date),
        weight: record.weight
    }));

    const toLineData = (records: Record[]) => {
        let data: lineDataItem[] = [];
        records
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach((record: Record) => data.push({
            value: record.weight,
            label: record.date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short"
            })
        }))
        return data;
    };

    const getBest = (records: Record[]) => {
        return Math.max(...records.map((record: Record) => record.weight));
    };

    const getLatest = (records: Record[]) => {
        return records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record: Record) => record.weight)[0];
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{exercise}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{getBest(history)}kg</Text>
                        <Text style={styles.cardLabel}>Personal Best</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{getLatest(history)}kg</Text>
                        <Text style={styles.cardLabel}>Latest</Text>
                    </View>
                </View>
            </View>
            <LineChart
                data={toLineData(history)}
                width={320}
                height={250}
                color="#4a9e02"
                thickness={3}
                dataPointsColor="#4a9e02"
                xAxisColor="#E5E5E5"
                yAxisColor="#E5E5E5"
                xAxisThickness={1}
                yAxisThickness={1}
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
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFF"
    },

    header: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E9ECEF",
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#212529",
        textAlign: "center",
        marginBottom: 20,
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12
    },

    card: {
        flex: 1,
        backgroundColor: "#4a9e02",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },

    cardValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4
    },

    cardLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
        opacity: 0.9
    }
});

export default ViewRecordScreen;
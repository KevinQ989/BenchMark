import { WorkoutRecord } from "@/constants/Types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";

const CalendarScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const history: WorkoutRecord[] = JSON.parse(
        (params.history as string) || "[]",
        (key, value) => {
            if (key === "date" && typeof value === "string") {
                return new Date(value);
            } else return value;
        }
    );

    const getMarkedDates = (history: WorkoutRecord[]) => {
		const dates: Date[] = history.map((item: WorkoutRecord) => item.date);
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

    return (
        <SafeAreaView>
            <Calendar
                onDayPress={day => router.replace({
                    pathname: '/(tabs)/history',
                    params: {
                        date: day.dateString
                    }
                })}
                markedDates={getMarkedDates(history)}
            />
        </SafeAreaView>
    );
};

export default CalendarScreen;
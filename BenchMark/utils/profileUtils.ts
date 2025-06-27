import { MarkedDates } from "react-native-calendars/src/types";
import { barDataItem } from "react-native-gifted-charts";

export const toMarkedDates = (dates: Date[]) => {
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

export const toBarData = (dates: Date[]) => {
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

export const getMax = (barDataItems: barDataItem[], goal: number) => {
    let count: number[] = [];
    barDataItems.forEach((item: barDataItem) => {
        count.push(item.value || 0)
    });
    return Math.max(...count, goal);
};

export const formatDuration = (n: number) => {
    const totalSeconds = Math.floor(n);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60)
    return `${hours}h ${minutes}m ${seconds}s`;
};
import { Record } from "@/constants/Types";
import { lineDataItem } from "react-native-gifted-charts";

export const toLineData = (records: Record[]) => {
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

export const getBest = (records: Record[]) => {
    return Math.max(...records.map((record: Record) => record.weight));
};

export const getLatest = (records: Record[]) => {
    return records
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((record: Record) => record.weight)[0];
};
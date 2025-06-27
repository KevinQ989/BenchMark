import { barDataItem } from "react-native-gifted-charts";
import {
    toMarkedDates,
    toBarData,
    getMax,
    formatDuration
} from "@/utils/profileUtils";

describe("profileUtils", () => {
    describe("toMarkedDates", () => {
        test("Convert Empty Array", () => {
            const arr: Date[] = [];
            expect(toMarkedDates(arr)).toEqual({});
        });

        test("Convert Single Date", () => {
            const arr: Date[] = [
                new Date("2025-06-12T10:00:00Z")
            ];
            expect(toMarkedDates(arr)).toEqual({
                "2025-06-12": {
                    marked: true,
                    dotColor: "#4CAF50",
                    activeOpacity: 0.8
                }
            });
        });

        test("Convert Multiple Dates", () => {
            const arr: Date[] = [
                new Date("2025-06-12T10:00:00Z"),
                new Date("2025-06-19T04:30:10Z"),
                new Date("2025-06-24T09:10:05Z")
            ];
            expect(toMarkedDates(arr)).toEqual({
                "2025-06-12": {
                    marked: true,
                    dotColor: "#4CAF50",
                    activeOpacity: 0.8
                },
                "2025-06-19": {
                    marked: true,
                    dotColor: "#4CAF50",
                    activeOpacity: 0.8
                },
                "2025-06-24": {
                    marked: true,
                    dotColor: "#4CAF50",
                    activeOpacity: 0.8
                }
            });
        });
    });

    describe("toBarData", () => {
        test("Convert Empty Array", () => {
            const arr: Date[] = [];
            expect(toBarData(arr)).toEqual([
                {
                    value: 0,
                    label: "11 May"
                },
                {
                    value: 0,
                    label: "18 May"
                },
                {
                    value: 0,
                    label: "25 May"
                },
                {
                    value: 0,
                    label: "01 Jun"
                },
                {
                    value: 0,
                    label: "08 Jun"
                },
                {
                    value: 0,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ]);
        });

        test("Convert Single Date", () => {
            const arr: Date[] = [
                new Date("2025-06-12T10:00:00Z")
            ];
            expect(toBarData(arr)).toEqual([
                {
                    value: 0,
                    label: "11 May"
                },
                {
                    value: 0,
                    label: "18 May"
                },
                {
                    value: 0,
                    label: "25 May"
                },
                {
                    value: 0,
                    label: "01 Jun"
                },
                {
                    value: 1,
                    label: "08 Jun"
                },
                {
                    value: 0,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ]);
        });

        test("Convert Multiple Dates", () => {
            const arr: Date[] = [
                new Date("2025-06-12T10:00:00Z"),
                new Date("2025-06-19T04:30:10Z"),
                new Date("2025-06-20T09:10:05Z")
            ];
            expect(toBarData(arr)).toEqual([
                {
                    value: 0,
                    label: "11 May"
                },
                {
                    value: 0,
                    label: "18 May"
                },
                {
                    value: 0,
                    label: "25 May"
                },
                {
                    value: 0,
                    label: "01 Jun"
                },
                {
                    value: 1,
                    label: "08 Jun"
                },
                {
                    value: 2,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ]);
        });
    });

    describe("getMax", () => {
        test("Handle Max is Goal", () => {
            const arr: barDataItem[] = [
                {
                    value: 1,
                    label: "08 Jun"
                },
                {
                    value: 2,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ];
            expect(getMax(arr, 4)).toBe(4);
        });

        test("Handle Max in Array", () => {
            const arr: barDataItem[] = [
                {
                    value: 1,
                    label: "08 Jun"
                },
                {
                    value: 2,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ];
            expect(getMax(arr, 1)).toBe(2);
        });

        test("Handle Empty Array", () => {
            const arr: barDataItem[] = [];
            expect(getMax(arr, 1)).toBe(1);
        });

        test("Handle Undefined Values in Array", () => {
            const arr: barDataItem[] = [
                {
                    value: undefined,
                    label: "08 Jun"
                },
                {
                    value: undefined,
                    label: "15 Jun"
                },
                {
                    value: 0,
                    label: "22 Jun"
                }
            ];
            expect(getMax(arr, 0)).toBe(0);
        });
    });

    describe("formatDuration", () => {
        test("Convert Seconds Correctly", () => {
            expect(formatDuration(0)).toBe("0h 0m 0s");
            expect(formatDuration(35)).toBe("0h 0m 35s");
        });

        test("Convert Minutes Correctly", () => {
            expect(formatDuration(60)).toBe("0h 1m 0s");
            expect(formatDuration(160)).toBe("0h 2m 40s");
        });

        test("Convert Hours Correctly", () => {
            expect(formatDuration(3600)).toBe("1h 0m 0s");
            expect(formatDuration(3661)).toBe("1h 1m 1s");
        });
    });
});
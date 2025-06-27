import { Record } from "@/constants/Types";
import {
    toLineData,
    getBest,
    getLatest
} from "@/utils/recordUtils"

describe("recordUtils", () => {
    describe("toLineData", () => {
        test("Convert No Records", () => {
            const arr: Record[] = [];
            expect(toLineData(arr)).toEqual([]);
        });

        test("Convert Single Record", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                }
            ];
            expect(toLineData(arr)).toEqual([
                {
                    value: 80,
                    label: "12 Jun"
                }
            ]);
        });

        test("Convert Multiple Records", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                },
                {
                    date: new Date("2025-06-24T09:10:05Z"),
                    weight: 100
                },
                {
                    date: new Date("2025-06-19T04:30:10Z"),
                    weight: 90
                }
            ];
            expect(toLineData(arr)).toEqual([
                {
                    value: 80,
                    label: "12 Jun"
                },
                {
                    value: 90,
                    label: "19 Jun"
                },
                {
                    value: 100,
                    label: "24 Jun"
                }
            ]);
        });
    });

    describe("getBest", () => {
        test("Handle Single Record", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                }
            ];
            expect(getBest(arr)).toBe(80);
        });

        test("Handle Multiple Records", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                },
                {
                    date: new Date("2025-06-19T09:10:05Z"),
                    weight: 100
                },
                {
                    date: new Date("2025-06-24T04:30:10Z"),
                    weight: 90
                }
            ];
            expect(getBest(arr)).toBe(100);
        });
    });

    describe("getLatest", () => {
        test("Handle Single Record", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                }
            ];
            expect(getLatest(arr)).toBe(80);
        });

        test("Handle Multiple Records", () => {
            const arr: Record[] = [
                {
                    date: new Date("2025-06-12T10:00:00Z"),
                    weight: 80
                },
                {
                    date: new Date("2025-06-19T09:10:05Z"),
                    weight: 100
                },
                {
                    date: new Date("2025-06-24T04:30:10Z"),
                    weight: 90
                }
            ];
            expect(getLatest(arr)).toBe(90);
        });
    });
});
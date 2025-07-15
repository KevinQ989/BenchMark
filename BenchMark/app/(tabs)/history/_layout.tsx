import { Stack } from "expo-router";
import React from "react";

const HistoryLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="calendar" 
                options={{ 
                    headerTitle: "Calendar",
                    headerBackTitle: "History"
                }}
            />
        </Stack>
    );
};

export default HistoryLayout;
import { Stack } from "expo-router";
import React from "react";

const HomeLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="previewRoutine" options={{
                    headerTitle: "",
                    headerBackTitle: "Home"
                }}
            />
        </Stack>
    )
}

export default HomeLayout;
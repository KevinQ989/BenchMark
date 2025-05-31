import { Stack } from "expo-router";
import React from "react";

const HomeLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="routinePreview" options={{
                headerShown: false,
                presentation: "modal"
            }} />
            <Stack.Screen name="routine" options={{headerShown: false}} />
        </Stack>
    )
}

export default HomeLayout;
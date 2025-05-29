import { Stack } from "expo-router";
import React from "react";

const ExercisesLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="previewExercise" options={{
                    headerTitle: "",
                    headerBackTitle: "Home"
                }}
            />
        </Stack>
    )
}

export default ExercisesLayout;
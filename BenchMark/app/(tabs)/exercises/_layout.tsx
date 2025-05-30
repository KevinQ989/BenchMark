import { Stack } from "expo-router";
import React from "react";

const ExercisesLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="previewExercise" options={{
                    presentation: "modal",
                    headerShown: false
                }}
            />
            <Stack.Screen name="addExercise" options={{
                    presentation: "modal",
                    title: "Add Exercise"
                }}
            />
            <Stack.Screen name="filterExercise" options={{
                    presentation: "modal",
                    title: "Filter"
                }}
            />
        </Stack>
    )
}

export default ExercisesLayout;
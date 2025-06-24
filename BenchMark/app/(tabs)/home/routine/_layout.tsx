import { Stack } from "expo-router";
import React from "react";

const RoutineLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="addExercise" />
      <Stack.Screen
        name="aiRecommendations"
        options={{
          title: "AI Recommendations",
          headerBackTitle: "Routine",
        }}
      />
    </Stack>
  );
};

export default RoutineLayout;

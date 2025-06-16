import { Stack } from "expo-router";
import React from "react";

const RoutineLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="addExercise" />
    </Stack>
  );
};

export default RoutineLayout;

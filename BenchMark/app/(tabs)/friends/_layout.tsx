import { Stack } from "expo-router";
import React from "react";

const FriendsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addFriend"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="friendRequests"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default FriendsLayout;

import { Stack } from "expo-router";
import React from "react";

const ProfileLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="editProfile" options={{
                headerShown: false,
                presentation: "modal"
            }} />
            <Stack.Screen name="addRecord" options={{
                headerShown: false,
                presentation: "modal"
            }} />
        </Stack>
    )
}

export default ProfileLayout;
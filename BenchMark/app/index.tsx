import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View, Button, ActivityIndicator } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import React from "react";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        setLoading(true);
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            alert("Check your emails!");
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("Registration Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async () => {
        setLoading(true);
        try {
            await auth().signInWithEmailAndPassword(email, password);
        } catch (e: any) {
            const err = e as FirebaseError;
            alert("Sign In Failed: " + err.message);
        } finally {
            setLoading(false);
        }

    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior="padding">
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="password"
                />
                {loading ? (
                    <ActivityIndicator size={'small'} style={{margin: 28}} />
                ) : (
                    <>
                        <Button onPress={signIn} title="Login" />
                        <Button onPress={signUp} title="Create Account" />
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: "center"
    },

    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: "#fff"
    }
});

export default LoginScreen;
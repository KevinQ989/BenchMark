import { useState } from "react";
import { Image } from "expo-image";
import { Alert, KeyboardAvoidingView, StyleSheet, View, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import auth from "@react-native-firebase/auth";
import { setDoc, doc, getFirestore } from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";
import React from "react";

const LoginScreen = () => {
    const db = getFirestore();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signup, setSignup] = useState(false);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            await auth().signInWithEmailAndPassword(email, password);
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Sign In Failed", err.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async (username: string, email: string, password: string) => {
        setLoading(true);
        try {
            const userCredentials = await auth().createUserWithEmailAndPassword(email, password);
            const uid = userCredentials.user.uid;
            const docRef = await setDoc(doc(db, "users", uid), {
                username: username,
                email: email
            });
            console.log("User Doc written with ID: " + uid);
            return userCredentials.user;
        } catch (e: any) {
            const err = e as FirebaseError;
            Alert.alert("Registration Failed", err.message);
        } finally {
            setLoading(false);
        }
    }

    const SignUpView = () => {
        return (
            <KeyboardAvoidingView behavior = "padding" style={styles.contentContainer}>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="Username"
                />
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
                    placeholder="Password"
                />
                {loading ? (
                    <ActivityIndicator size={'small'} style={{margin: 28}} />
                ) : (
                    <>
                        <TouchableOpacity style={styles.submitContainer} onPress={() => signUp(username, email, password)}>
                            <Text style={styles.submitText}>Create Account</Text>
                        </TouchableOpacity>
                        <Text style={styles.changeText}>Already have an account?</Text>
                        <TouchableOpacity style={styles.changeContainer} onPress={() => setSignup(false)}>
                            <Text style={styles.changeButton}>Login</Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardAvoidingView>
        );
    };

    const SignInView = () => {
        return (
            <KeyboardAvoidingView behavior = "padding" style={styles.contentContainer}>
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
                    placeholder="Password"
                />
                {loading ? (
                    <ActivityIndicator size={'small'} style={{margin: 28}} />
                ) : (
                    <>
                        <TouchableOpacity style={styles.submitContainer} onPress={() => signIn(email, password)}>
                            <Text style={styles.submitText}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.changeText}>Don't have an account?</Text>
                        <TouchableOpacity style={styles.changeContainer} onPress={() => setSignup(true)}>
                            <Text style={styles.changeButton}>Create Account</Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardAvoidingView>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require("@/assets/images/BenchMarkLogo.png")} style={styles.logo} />
            </View>
            {signup ? SignUpView() : SignInView()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#000"
    },

    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 0
    },

    logo: {
      height: 300,
      width: 300
    },

    contentContainer: {
        marginHorizontal: 20
    },

    input: {
        marginVertical: 8,
        height: 50,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#FFF",
        fontSize: 16
    },

    submitContainer: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 16,
        marginVertical: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },

    submitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    },

    changeContainer: {
        alignItems: "center",
        padding: 12,
        marginTop: 8
    },

    changeText: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
        marginTop: 20
    },

    changeButton: {
        color: "#007AFF"
    }
});

export default LoginScreen;
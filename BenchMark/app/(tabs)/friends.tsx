import { View, Text, StyleSheet } from "react-native";

const FriendsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>You have not added any friends</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center"
    },

    text: {
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center"
    }
});

export default FriendsScreen;
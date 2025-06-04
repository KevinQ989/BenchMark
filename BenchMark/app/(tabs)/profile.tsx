import { Button, SafeAreaView, StyleSheet, View } from "react-native";
import auth from "@react-native-firebase/auth";

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.subContainer}>
                <Button title="Sign Out" onPress={() => auth().signOut()} />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: "#FFF"
    },
  
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    
    subContainer: {
      gap: 8,
      marginBottom: 8,
    }
});

export default ProfileScreen;
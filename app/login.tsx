const React = require("react");
const Login = require("./screens/Login");
const { SafeAreaView, StyleSheet } = require("react-native");

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Login />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

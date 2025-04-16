const React = require("react");
const { SafeAreaView } = require("react-native");
const ChangePassword = require("./screens/ChangePassword");

export default function ChangePasswordRoute() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ChangePassword />
        </SafeAreaView>
    );
}

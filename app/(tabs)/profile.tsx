const React = require("react");
const { SafeAreaView } = require("react-native");
const Profile = require("../screens/Profile");

export default function ProfileTab() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Profile />
        </SafeAreaView>
    );
}

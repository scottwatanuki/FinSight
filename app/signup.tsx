const React  = require( "react");
const Signup  = require( "./screens/Signup");
const { SafeAreaView, StyleSheet }  = require( "react-native");

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Signup />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
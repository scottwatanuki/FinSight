const {
    withAndroidManifest,
    withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = function withFirebaseAnalytics(config) {
    // Add Firebase Analytics configuration to Android manifest
    config = withAndroidManifest(config, (config) => {
        const manifest = config.modResults;

        // Modify AndroidManifest.xml here if needed
        // For example, adding Firebase service configurations

        return config;
    });

    // Modify build.gradle for Firebase setup
    config = withAppBuildGradle(config, (config) => {
        const buildGradle = config.modResults;

        // Add Firebase dependencies to the Gradle file
        buildGradle.contents += `
    implementation 'com.google.firebase:firebase-analytics:17.2.2'
    `;

        return config;
    });

    return config;
};

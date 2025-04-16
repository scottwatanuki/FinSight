const { View, ViewProps } = require("react-native");
const { useThemeColor } = require("@/hooks/useThemeColor");

// TypeScript type declaration with JSDoc
/** @typedef {ViewProps & { lightColor?: string; darkColor?: string; }} ThemedViewProps */

function ThemedView({ style, lightColor, darkColor, ...otherProps }) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );

    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Export the component using module.exports
module.exports = ThemedView;

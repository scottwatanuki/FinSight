const { Link } = require("expo-router");
const { openBrowserAsync } = require("expo-web-browser");
const { ComponentProps } = require("react");
const { Platform } = require("react-native");

// TypeScript type declaration
/** @type {Omit<ComponentProps<typeof Link>, "href"> & { href: string }} */
const Props = {};

// Your function component
function ExternalLink({ href, ...rest }) {
    return (
        <Link
            target="_blank"
            {...rest}
            href={href}
            onPress={async (event) => {
                if (Platform.OS !== "web") {
                    // Prevent the default behavior of linking to the default browser on native.
                    event.preventDefault();
                    // Open the link in an in-app browser.
                    await openBrowserAsync(href);
                }
            }}
        />
    );
}

module.exports = ExternalLink;

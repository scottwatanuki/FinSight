import Constants, { ExecutionEnvironment } from "expo-constants";

// `true` when running in Expo Go.
const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let analytics;
if (!isExpoGo) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    analytics = (require("@react-native-firebase/analytics") as any).default;
}

export async function logButtonClick(trackGraph: string) {
    if (isExpoGo) {
        console.log("buttonClick analytics event, button: ", trackGraph);
    } else {
        await analytics().logEvent("button_click", {
            graphInteraction: trackGraph,
        });
    }
}

export async function logViewChange(newView: string) {
    if (isExpoGo) {
        console.log("view_change analytics event:", { view: newView });
    } else {
        await analytics().logEvent("view_change", {
            view: newView,
        });
    }
}

export async function logTabChange(tabName: string) {
    if (isExpoGo) {
        console.log("tab_change analytics event:", { tab: tabName });
    } else {
        await analytics().logEvent("tab_change", {
            tab: tabName,
        });
    }
}

export async function handleTrackGraphInteraction(buttonName: string) {
    if (isExpoGo) {
        console.log("buttonClick analytics event, button: ", buttonName);
    } else {
        await analytics().logEvent("button_click", {
            button_name: buttonName,
        });
    }
}

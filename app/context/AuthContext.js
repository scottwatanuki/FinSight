// app/context/AuthContext.js
const React = require("react");
const { createContext, useState, useEffect, useContext } = React;

const { onAuthStateChanged } = require("firebase/auth");
const { auth } = require("../../firebase");
const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
const { initializeUserIfNeeded } = require("../services/userInitialization");

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check AsyncStorage for cached user
        const loadCachedUser = async () => {
            try {
                const cachedUser = await AsyncStorage.getItem("@user");
                if (cachedUser) {
                    console.log("Found cached user data, setting user state");
                    setUser(JSON.parse(cachedUser));
                }
            } catch (error) {
                console.error("Error loading cached user:", error);
            }
        };

        loadCachedUser();

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log(
                "Auth state changed:",
                currentUser ? "user authenticated" : "user signed out"
            );

            if (currentUser) {
                console.log("User authenticated with UID:", currentUser.uid);

                // Save user to AsyncStorage for additional caching
                try {
                    // Only store essential user information
                    const userToCache = {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        emailVerified: currentUser.emailVerified,
                    };

                    await AsyncStorage.setItem(
                        "@user",
                        JSON.stringify(userToCache)
                    );
                    console.log("User data cached successfully");
                } catch (error) {
                    console.error("Error caching user:", error);
                }

                // Initialize user data structure if needed
                try {
                    const result = await initializeUserIfNeeded(
                        currentUser.uid,
                        currentUser.email
                    );
                    if (result.success) {
                        if (
                            result.created.user ||
                            result.created.payment ||
                            result.created.budget
                        ) {
                            console.log(
                                "Created missing user data:",
                                result.created
                            );
                        }
                    } else {
                        console.error(
                            "Error initializing user data:",
                            result.error
                        );
                    }
                } catch (error) {
                    console.error(
                        "Exception during user initialization:",
                        error
                    );
                }

                setUser(currentUser);
            } else {
                // No user is signed in, clear the cache
                try {
                    await AsyncStorage.removeItem("@user");
                    console.log("Cleared cached user data");
                } catch (error) {
                    console.error("Error clearing cached user:", error);
                }

                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { user, token, checkAuth } = useAuthStore();

  // run once to check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // handle redirection only after segments are available
  useEffect(() => {
    if (!segments.length) return; // wait until segments are loaded

    const isAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!(user && token);

    if (isAuthScreen && isSignedIn) {
      router.replace("/(tabs)");
    } else if (!isAuthScreen && !isSignedIn) {
      router.replace("/(auth)");
    }
  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

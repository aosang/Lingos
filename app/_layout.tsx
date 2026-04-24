import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import IntroScreen from '@/components/auth/IntroScreen';
import { useAuth } from '@/ctx/AuthContext';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import AuthProvider from '@/providers/AuthProvider';
import { useFonts } from "expo-font";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Toaster } from "sonner-native";

export const unstable_settings = {
  anchor: '(tabs)',
};

export function RootLayoutNav() {
  const {session, loading, profile} = useAuth()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
  });

  //  Handle deep linking for magic links
  useDeepLinking()

  if(!loaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </View>
    )
  }

  
  if(!session) {
    return (
      <ThemeProvider value={DefaultTheme}>
        <GestureHandlerRootView style={styles.container}>
          <IntroScreen />
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <Toaster />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav></RootLayoutNav>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
  }
})

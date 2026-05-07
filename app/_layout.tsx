import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import IntroScreen from '@/components/auth/IntroScreen';
import { useAuth } from '@/ctx/AuthContext';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import AuthProvider from '@/providers/AuthProvider';
import { useFonts } from "expo-font";
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, LogBox } from 'react-native';
import { Toaster } from "sonner-native";

if (__DEV__) {
  LogBox.ignoreLogs([
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
  ]);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export function RootLayoutNav() {
  const {session, loading, profile} = useAuth()
  const segments = useSegments()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
  });

  //  Handle deep linking for magic links
  useDeepLinking()

  useEffect(() => {
    if(!loading && session) {
      if(!profile || !profile.onboarding_completed) {
        const inOnboarding = segments[0] === "onboarding"
        
        if(!inOnboarding) {
          router.replace('/onboarding')
        }
      }
    }
  }, [session, loading, profile, segments])

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
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <Toaster />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
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

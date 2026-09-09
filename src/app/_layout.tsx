import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="show/[id]" />
      <Stack.Screen name="collections/[language]" />
      <Stack.Screen name="collection/[id]" />
    </Stack>
  );
}
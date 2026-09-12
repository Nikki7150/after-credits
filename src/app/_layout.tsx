import { Stack } from "expo-router";
import { useFonts, ReenieBeanie_400Regular } from '@expo-google-fonts/reenie-beanie';
import { JimNightshade_400Regular } from '@expo-google-fonts/jim-nightshade';
import { RockSalt_400Regular } from '@expo-google-fonts/rock-salt'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ReenieBeanie_400Regular,
    JimNightshade_400Regular, 
    RockSalt_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="show/[id]" />
      <Stack.Screen name="collection/[id]" />
      <Stack.Screen name="collections/all" />
    </Stack>
  );
}
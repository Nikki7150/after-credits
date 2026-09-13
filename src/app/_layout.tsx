import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts, ReenieBeanie_400Regular } from '@expo-google-fonts/reenie-beanie';
import { JimNightshade_400Regular } from '@expo-google-fonts/jim-nightshade';
import { RockSalt_400Regular } from '@expo-google-fonts/rock-salt';
import React, { useEffect, useState} from 'react';

import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ReenieBeanie_400Regular,
    JimNightshade_400Regular, 
    RockSalt_400Regular,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login';
    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) return null;
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
      <Stack.Screen name="profile" />
    </Stack>
  );
}
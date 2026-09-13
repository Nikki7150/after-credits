import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, Redirect, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Session } from '@supabase/supabase-js';

import AppTabs from '@/components/app-tabs';
import { supabase } from '@/lib/supabase';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
        </ThemeProvider>
    );
}

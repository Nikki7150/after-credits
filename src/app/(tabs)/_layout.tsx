import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, Redirect, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Session } from '@supabase/supabase-js';

import AppTabs from '@/components/app-tabs';
import { supabase } from '@/lib/supabase';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return null;
    }

    if (!session) {
        return <Redirect href="/login" />;
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
        </ThemeProvider>
    );
}

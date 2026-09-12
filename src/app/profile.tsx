import { FlatList, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect, router } from 'expo-router'; // runs every time screen in focus
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Palette } from '@/constants/theme';
import Icon from 'react-native-ico-material-design';

export default function ProfileScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; 
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id);
        if (error) console.error("Error fetching profile: ", error);
        else if (data && data.length > 0) setUsername(data[0].username);
        else setUsername(null);
        setProfileLoading(false)
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out: ', error);
        
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Pressable onPress={() => router.back()}>
                <Text style={{ color: Palette.blackRaspberry, fontWeight: 500, fontSize: 20, }}>く</Text>
            </Pressable>
            <ThemedText type="title" style={{ color: Palette.darkSienna, fontFamily: 'RockSalt_400Regular', lineHeight: 90, paddingTop: 5, height: 70, paddingLeft: 5, }}>Profile</ThemedText>
            <Pressable onPress={() => handleSignOut()}>
                <Text style={{ color: Palette.blackRaspberry, fontWeight: 500, fontSize: 20, }}>Sign Out</Text>
            </Pressable>
            <ThemedText style={{ color: Palette.blackRaspberry, fontSize: 20 }}>
                {username ?? 'Set a username'}
            </ThemedText>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Palette.moonRock,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.four,
        gap: Spacing.three,
        paddingBottom: Spacing.three,
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        width: '100%',
    },
});
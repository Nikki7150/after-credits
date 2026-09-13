import { FlatList, Platform, Pressable, StyleSheet, Text, Image, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect, router } from 'expo-router'; // runs every time screen in focus
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Palette } from '@/constants/theme';
import Icon from 'react-native-ico-material-design';
import { IMAGE_BASE_URL } from '@/lib/tmdb';

export default function ProfileScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileModal, isProfileModal] = useState(false);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; 
        setEmail(user.email ?? null);
        const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id);
        if (error) console.error("Error fetching profile: ", error);
        else if (data && data.length > 0) { setUsername(data[0].username); setProfilePic(data[0].avatar_url); }
        else { setUsername(null); setProfilePic(null); }
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
            <ThemedText type="title" style={{ color: Palette.darkSienna, fontFamily: 'RockSalt_400Regular', lineHeight: 85, paddingTop: 6, paddingLeft: 5, height: 65, }}>Profile</ThemedText>
            {profilePic ? (
                <View>
                    <Image
                        source={{ uri: profilePic }}
                        style={styles.profilePic}
                    />
                    <Pressable onPress={() => isProfileModal(true)} style={{ backgroundColor: Palette.softDove, borderRadius: 15, padding: 5, width: 25, position: 'absolute', right: 10, bottom: 0, }}>
                        <Icon name="create-new-pencil-button" width={16} height={16} color={Palette.spicedHotChocolate} />
                    </Pressable>
                </View>
            ) : (
                <Icon name="round-account-button-with-user-inside" height={125} width={125} color={Palette.spicedHotChocolate} />
            )}
            <Modal visible={profileModal} transparent animationType="fade">
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',  }} onPress={() => isProfileModal(false)}>
                    <View style={{ backgroundColor: Palette.softDove, borderRadius: 8, padding: 20, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)', justifyContent: 'center', alignItems: 'center',  }}>
                        <Text style={{ fontFamily: 'JimNightshade_400Regular', fontSize: 30, color: Palette.darkSienna, }}>Upload profile picture</Text>
                        <Text style={{ fontFamily: 'JimNightshade_400Regular', fontSize: 20, color: Palette.blackRaspberry, }}>(square image recommended)</Text>
                        <Pressable style={[styles.profilePic, { borderWidth: 2, borderColor: Palette.spicedHotChocolate, backgroundColor: Palette.moonRock, }]}>
                            <Icon name="google-drive-image" height={40} width={40} color={Palette.spicedHotChocolate} style={{ top: 40, left: 40, }} />
                        </Pressable>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 30, margin: 5 }}>
                            <Pressable onPress={() => isProfileModal(false)} style={[styles.modalButtons, {backgroundColor: Palette.softDove}]}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={() => { isProfileModal(false); }} style={styles.modalButtons}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}> Save </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',  alignItems: 'center', width: '100%',  }}>
                <Text>Username: </Text>
                <ThemedText style={{ color: Palette.blackRaspberry, fontSize: 20 }}>
                    {username ?? 'Set a username'}
                </ThemedText>
                <Pressable style={{ padding: 10, borderWidth: 1, borderColor: Palette.softDove, marginLeft: 30, }}>
                    <Icon name="create-new-pencil-button" width={15} height={15} color={Palette.softDove} />
                </Pressable>
            </View>
            <View >
                <ThemedText style={{ color: Palette.blackRaspberry, fontSize: 20 }}>
                    {email ?? 'No email set'}
                </ThemedText>
            </View>
            <Pressable onPress={() => handleSignOut()}>
                <Text style={{ color: Palette.blackRaspberry, fontWeight: '500', fontSize: 20, }}>Sign Out</Text>
            </Pressable>
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
        alignItems: 'center',
    },
    profilePic: {
        width: 125,
        height: 125,
        borderRadius: 62.5,
        marginTop: 10,
    },
    modalButtons: {
        fontFamily: 'RockSalt_400Regular',
        paddingLeft: 5, 
        paddingRight: 5, 
        backgroundColor: Palette.moonRock, 
        borderRadius: 5,
        marginTop: 5,
        borderWidth: 2, 
        borderColor: Palette.moonRock,
    },
});
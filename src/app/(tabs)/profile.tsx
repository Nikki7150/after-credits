import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text, Image, View, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Palette } from '@/constants/theme';
import Icon from 'react-native-ico-material-design';
import { Lucide } from "@react-native-vector-icons/lucide";


export default function ProfileScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileModal, isProfileModal] = useState(false);
    const [usernameModal, isUsernameModal] = useState(false);
    const [passwordModal, isPasswordModal] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

    const handleUpdateUsername = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ username: editedUsername })
            .eq('id', user.id);
        if (error) console.error('Error updating username: ', error);
        else {
            setUsername(editedUsername);
            isUsernameModal(false);
        }
    }

    const handleChangePassword = async () => {
        const { error } = await supabase.auth.updateUser({ password: editedPassword });
        if (error) console.error('Error updating password: ', error);
        else {
            setEditedPassword('');
            isPasswordModal(false);
        }
    };

    const uploadAvatar = async (uri: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const response = await fetch(uri);
        const blob = await response.blob();
        const filePath = `${user.id}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return;
        }
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', user.id);
        if (updateError) {
            console.error('Error updating profile:', updateError);
        } else {
            setProfilePic(urlData.publicUrl);
            isProfileModal(false);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) uploadAvatar(result.assets[0].uri);
    };

    const handleModalFunction = () => {
        if (profileModal) {
            isPasswordModal(false);
        } else if (usernameModal) {
            handleUpdateUsername();
        } else if (passwordModal) {
            handleChangePassword();
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert('Delete Account', 'This will permanently delete all your shows, collections, and profile data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;
                        const { error: showsError } = await supabase
                            .from('shows')
                            .delete()
                            .eq('user_id', user.id);
                        if (showsError) console.error('error deleting shows: ', showsError);
                        const { error: collectionsError } = await supabase
                            .from('collections')
                            .delete()
                            .eq('user_id', user.id);
                        if (collectionsError) console.error('error deleting collections: ', collectionsError);
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .delete()
                            .eq('id', user.id);
                        if (profileError) console.error('error deleting profile: ', profileError);
                        const { error: signOutError } = await supabase.auth.signOut();
                        if (signOutError) console.error('Error signing out: ', signOutError);
                    },
                },
            ]
        );
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
            <Modal visible={profileModal || usernameModal || passwordModal} transparent animationType="fade">
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',  }} onPress={() => { isProfileModal(false); isUsernameModal(false); isPasswordModal(false); }}>
                    <View style={{ backgroundColor: Palette.softDove, borderRadius: 8, padding: 20, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)', justifyContent: 'center', alignItems: 'center', width: 300, }}>
                        <Text style={{ fontFamily: 'JimNightshade_400Regular', fontSize: 30, color: Palette.darkSienna, }}>{profileModal ? 'Upload profile picture' : usernameModal ? 'Enter new Username' : passwordModal ? 'Enter new Password' : ' '}</Text>
                        <Text style={{ fontFamily: 'JimNightshade_400Regular', fontSize: 20, color: Palette.blackRaspberry, height: profileModal ? 24 : 0 }}>{profileModal ? '(square image recommended)' : ''}</Text>
                        {profileModal ? (
                            <Pressable onPress={() => handlePickImage()} style={[styles.profilePic, { borderWidth: 2, borderColor: Palette.spicedHotChocolate, backgroundColor: Palette.moonRock, }]}>
                                <Icon name="google-drive-image" height={40} width={40} color={Palette.spicedHotChocolate} style={{ top: 40, left: 40, }} />
                            </Pressable>
                        ) : usernameModal ? (
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setEditedUsername(value)}
                                value={editedUsername}
                                placeholder={username ?? 'Set a username'}
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <TextInput
                                    style={[styles.input, { width: '95%' }]}
                                    onChangeText={(value) => setEditedPassword(value)}
                                    value={editedPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="new password"
                                    placeholderTextColor="#999"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 5, }}>
                                    <Lucide name={showPassword ? "eye" : "eye-closed"} size={20} color={Palette.darkSienna} />
                                </Pressable>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 30, margin: 5 }}>
                            <Pressable onPress={() => { isProfileModal(false); isUsernameModal(false); isPasswordModal(false); }} style={[styles.modalButtons, {backgroundColor: Palette.softDove}]}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={() => handleModalFunction()} style={styles.modalButtons}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}> Save </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',  alignItems: 'center', width: '100%',  }}>
                <Text style={{ color: Palette.blackRaspberry, fontSize: 20, fontFamily: 'JimNightshade_400Regular', }}>Username: </Text>
                <ThemedText style={{ fontSize: 40, fontFamily: 'ReenieBeanie_400Regular', lineHeight: 40, color: Palette.darkSienna, }}>
                    {username ?? 'Set a username'}
                </ThemedText>
                <Pressable onPress={() => isUsernameModal(true)} style={{ padding: 10, borderWidth: 1, borderColor: Palette.softDove, marginLeft: 10, }}>
                    <Icon name="create-new-pencil-button" width={15} height={15} color={Palette.softDove} />
                </Pressable>
            </View>
            <ThemedText style={{ fontSize: 30, fontFamily: 'ReenieBeanie_400Regular', lineHeight: 40, color: Palette.darkSienna, borderBottomWidth: 1, borderColor: Palette.spicedHotChocolate }}>
                {email ?? 'No email set'}
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',  alignItems: 'center', width: '100%',  }}>
                <Text style={{ color: Palette.blackRaspberry, fontSize: 20, fontFamily: 'JimNightshade_400Regular', }}>Password: </Text>
                <ThemedText style={{ fontSize: 40, fontFamily: 'ReenieBeanie_400Regular', lineHeight: 40, color: Palette.darkSienna, }}>
                    ••••••••
                </ThemedText>
                <Pressable onPress={() => isPasswordModal(true)} style={{ padding: 10, borderWidth: 1, borderColor: Palette.softDove, marginLeft: 10, }}>
                    <Icon name="create-new-pencil-button" width={15} height={15} color={Palette.softDove} />
                </Pressable>
            </View>
            <Pressable onPress={() => handleSignOut()}>
                <Text style={{ color: Palette.blackRaspberry, fontWeight: '500', fontSize: 20, }}>Sign Out</Text>
            </Pressable>
            <Pressable onPress={handleDeleteAccount}>
                <Text style={{ color: Palette.darkSienna, fontWeight: '500', fontSize: 20, }}>Delete Account</Text>
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
        borderWidth: 2,
        borderColor: Palette.spicedHotChocolate,
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
    input: {
        justifyContent: "center",
        alignItems: "stretch",
        borderWidth: 2,
        height: undefined,
        minHeight: 50,
        borderColor: Palette.spicedHotChocolate,
        padding: 5,
        fontFamily: 'ReenieBeanie_400Regular',
        fontSize: 28,
        lineHeight: 35,
        width: '100%',
    }
});
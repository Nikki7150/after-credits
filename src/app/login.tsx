import { View, Text, StyleSheet, TextInput, Pressable, } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            }
        } catch (err) {
            console.error('Error logging in:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        username: username,
                    });
                if (profileError) console.error('Error creating profile: ', profileError);
            }
        } catch (err) {
            console.error('Error signing up:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedText type='title' style={{ fontSize: 41.5, color: Palette.darkSienna, fontFamily: 'RockSalt_400Regular', lineHeight: 80, paddingLeft: 7, height: 70, }}>AfterCredits</ThemedText>
            <ThemedText type="subtitle" style={{ color: Palette.spicedHotChocolate, fontFamily: 'ReenieBeanie_400Regular', fontSize: 30, lineHeight: 25, textAlign: 'center', marginBottom: 20, }}>The experience isn't over when the credits roll</ThemedText>
            {isSignUp && (
                <TextInput
                    placeholder="Username"
                    style={styles.textInput}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize='none'
                />
            )}
            <TextInput
                placeholder="Email"
                style={styles.textInput}
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                style={styles.textInput}
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable onPress={isSignUp ? handleSignUp : handleLogin} style={styles.button} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}</Text>
            </Pressable>
            <Pressable onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 10 }}>
                <Text style={{ color: Palette.blackRaspberry, fontFamily: 'JimNightshade_400Regular', fontSize: 20, }}>{isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.four,
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        width: '100%',
        backgroundColor: Palette.softDove,
        justifyContent: 'center',
    },
    textInput: {
        height: 40,
        borderBottomWidth: 2,
        borderColor: Palette.moonRock,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: Palette.blackRaspberry,
        fontFamily: 'ReenieBeanie_400Regular',
        fontSize: 30,
    },
    button: {
        backgroundColor: Palette.darkSienna,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: Palette.softDove,
        fontSize: 16,
        fontFamily: 'RockSalt_400Regular',
    },
    errorText: {
        color: Palette.darkSienna,
        marginBottom: 12,
    },
});
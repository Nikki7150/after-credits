import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { IMAGE_BASE_URL } from "@/lib/tmdb";

export default function ShowDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState<any>(null);
    const [text, setText] = useState('');
    const [save, setSave] = useState(false);

    useEffect(() => {
        const fetchShowDetails = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('shows')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) {
                    console.error('Error fetching shows:', error);
                } else if (data) {
                    setShow(data);
                }
            } catch (err) {
                console.error("Error fetching show details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShowDetails();
    }, [id]);

    useEffect(() => {
        if (show) {
            setText(show.notes ?? '');
        }
    }, [show]);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!show) {
        return (
            <View style={styles.center}>
                <Text>Show not found.</Text>
            </View>
        );
    }

    const handleRating = async (newRating: number) => {
        setShow({...show, rating: newRating });
        const { error } = await supabase
            .from('shows')
            .update({ rating: newRating })
            .eq('id', id);
        if (error) console.error('error updating rating: ', error);
    };

    const handleSaveNotes = async () => {
        setSave(true);
        const { error } = await supabase
            .from('shows')
            .update({ notes: text })
            .eq('id', id);
        if (error) console.error('Error saving notes: ', error);
        setTimeout(() => {
            setSave(false);
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text>Back</Text>
            </Pressable>
            {show.poster_path && (
                <Image
                    source={{ uri: `${IMAGE_BASE_URL}${show.poster_path}` }}
                    style={styles.poster}
                />
            )}
            <Text style={styles.title}>{show.title}</Text>
            <Text style={styles.year}>
                {show.release_date ? show.release_date.split('-')[0] : 'TBA'}
            </Text>
            <View style={{ flexDirection: 'row', gap: '4' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleRating(star)}>
                        <Text style={{ fontSize: 28, color: '#facb54' }}>
                            {star <= (show.rating ?? 0) ? '★' : '☆'}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <TextInput
                style={styles.input}
                multiline={true}
                onChangeText={(value) => setText(value)}
                value={text}
                placeholder="Put your thoughts here..."
                placeholderTextColor="#999"
            />
            {text.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, paddingTop: 5 }}>
                    <Pressable onPress={handleSaveNotes} style={styles.checkButton}>
                        <Text>✓</Text>
                    </Pressable>
                    <Text>{save ? 'Saving' : 'Saved'}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    poster: {
        width: 200,
        height: 300,
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
    year: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    input: {
        justifyContent: "center",
        alignItems: "stretch",
        borderWidth: 2,
        height: undefined,
        minHeight: 50,
        borderColor: "#d1d1d1",
        padding: 5,
    },
    checkButton: {

    }
})
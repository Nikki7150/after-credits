import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";

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

    useEffect(() => {
        if (show && show.genres === null && show.cast_members === null) {
            const fetchExtraDetails = async () => {
                try {
                    setLoading(true);
                    const response = await getShowDetails(show.tmdb_id, show.media_type);
                    const genreNames = response.genres ? response.genres.map((g: { name: any; }) => g.name) : [];
                    const castNames = response.credits?.cast ? response.credits.cast.slice(0, 10).map((c: { name: any; character: any; profile_path: any; }) => ({
                        name: c.name,
                        character: c.character,
                        profile_path: c.profile_path
                    })) : [];
                    const { error } = await supabase
                        .from('shows')
                        .update({
                            genres: genreNames,
                            cast_members: castNames
                        })
                        .eq('id', id);
                    if (error) throw error;
                    setShow({...show, genres: genreNames, cast_members: castNames});
                } catch (err) {
                    console.error('Error fetching extra details: ', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchExtraDetails();
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

    const handleStatus = async (newStatus: string) => {
        setShow({...show, status: newStatus });
        const { error } = await supabase
            .from('shows')
            .update({ status: newStatus })
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
            <View style={{ flexDirection: 'row', gap: '4', justifyContent: "center", padding: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleRating(star)}>
                        <Text style={{ fontSize: 30, color: '#facb54', textAlign: 'center' }}>
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
                    <Pressable onPress={() => handleSaveNotes}>
                        <Text>✓</Text>
                    </Pressable>
                    <Text>{save ? 'Saving' : 'Saved'}</Text>
                </View>
            )}
            <Pressable onPress={() => handleStatus(show.status === 'want_to_watch' ? 'watched' : 'want_to_watch')} style={show.status === 'want_to_watch' ? styles.wantButton : styles.watchButton}>
                <Text style={styles.meta1}>{show.status === 'watched' ? '☑ Watched' : '☐ Want to Watch'}</Text>
            </Pressable>
            {show.genres && show.genres.length > 0 && (
                <Text style={styles.meta}>{show.genres.join(', ')}</Text>
            )}
            {show.cast_members && show.cast_members.length > 0 && (
                <FlatList
                    style={styles.castContainer}
                    data={show.cast_members}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.castCard}>
                            {item.profile_path && (
                                <Image
                                    source={{ uri: `${IMAGE_BASE_URL}${item.profile_path}` }}
                                    style={styles.castPhoto}
                                />
                            )}
                            <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.castCharacter} numberOfLines={1}>{item.character}</Text>
                        </View>
                    )}
                />
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
    meta: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    meta1: {
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 16,
        fontFamily: 'Courier'
    },
    castContainer: {
        padding: 10,
    },
    castCard: {
        width: 100,
        marginRight: 12,
    },
    castPhoto: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    castName: {
        fontWeight: 'bold',
        fontSize: 13,
        marginTop: 4,
    },
    castCharacter: {
        fontSize: 12,
        color: 'gray',
    },
    wantButton: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'gray',
        padding: 15,
        margin: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
    watchButton: {
        backgroundColor: 'pink',
        padding: 15,
        margin: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
})
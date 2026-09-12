import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList, ScrollView, Modal } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LANGUAGE_NAMES } from "@/lib/languages";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import Icon from 'react-native-ico-material-design';
import { Palette } from "@/constants/theme";

export default function ShowDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState<any>(null);
    const [text, setText] = useState('');
    const [save, setSave] = useState(false);
    const [collectionsList, setCollectionsList] = useState<any[]>([]);
    const [isDropdownVisible, setIsDrowdownVisible] = useState(false);
    const [showCollectionNames, setShowCollectionNames] = useState<string[]>([]);
    const [collectionName, setCollectionName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

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

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching shows:', error);
            } else if (data) {
                setCollectionsList(data || []);
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchShowCollections = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('collection_shows')
                .select('collections(name)')
                .eq('show_id', id);
            if (error) {
                console.error('Error fetching show\'s collections: ', error);
            } else if (data) {
                const CollectionNames = data.map((row: any) => row.collections?.name).filter(Boolean);
                setShowCollectionNames(CollectionNames);
            }
        } catch (err) {
            console.error('Error fetching show collections: ', err);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchCollections();
        }, [fetchCollections])
    );

    useEffect(() => {
        if (show) {
            setText(show.notes ?? '');
        }
    }, [show]);

    useEffect(() => {
        fetchShowCollections();
    }, [fetchShowCollections]);

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

    const handleAddToCollection = async (collectionId: string) => {
        const { error } = await supabase
            .from('collection_shows')
            .upsert(
                {
                    collection_id: collectionId,
                    show_id: show.id,
                },
                { onConflict: 'collection_id,show_id', ignoreDuplicates: true }
            );
        if (error) console.error('error adding to collection: ', error);
        fetchShowCollections();
    };

    const handleCreateCollection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No user found');
            return;
        }
        const { error } = await supabase.from('collections').insert({
            user_id: user.id,
            name: collectionName,
        });
        if (error) {
            console.error('Error saving show:', error);
        } else {
            setCollectionName('');
            fetchCollections();
        }
    };

    const handleRemoveFromWatchlist = async () => {
        const { error } = await supabase
            .from('shows')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('error deleting from watchlist: ', error);
        } else {
            router.back();
        }
        setIsMenuVisible(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Palette.moonRock, }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={{ color: Palette.blackRaspberry, fontWeight: 500, fontSize: 20, }}>く</Text>
                    </Pressable>
                    <Pressable onPress={() => setIsMenuVisible(true)}>
                        <Text style={{ color: Palette.blackRaspberry, fontSize: 25, }}>⋮</Text>
                    </Pressable>
                </View>
                <Modal visible={isMenuVisible} transparent animationType="fade">
                    <Pressable style={{ flex: 1, backgroundColor: 'transparent' }} onPress={() => setIsMenuVisible(false)}>
                        <View style={{ position: 'absolute', top: 70, right: 30, backgroundColor: Palette.softDove, borderRadius: 8, padding: 10, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)' }}>
                            <Pressable onPress={handleRemoveFromWatchlist}>
                                <Text style={{ color: Palette.darkSienna, fontWeight: 500 }}> <Icon name="rubbish-bin-delete-button" height={13} width={13} color={Palette.darkSienna} /> Remove from Watchlist</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
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
                    <Text style={show.status === 'watched' ? styles.meta2 : styles.meta1}>{show.status === 'watched' ? '☑ Watched' : '☐ Want to Watch'}</Text>
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
                {show.language && (
                    <Text style={styles.meta1}>Language: {LANGUAGE_NAMES[show.language] ?? show.language}</Text>
                )}
                <Pressable onPress={() => setIsDrowdownVisible(!isDropdownVisible)} style={isDropdownVisible ? styles.collectionButton1 : styles.collectionButton}>
                    <Text style={{ color: Palette.softDove, fontWeight: 700, }}>
                        {showCollectionNames.length > 0 ? showCollectionNames.join(', ') : 'Add to Collection'}
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 2, color: Palette.softDove,  }}>▼</Text>
                </Pressable>
                {isDropdownVisible && (
                    <View style={styles.dropdown}>
                        {collectionsList.map((item) => (
                            <Pressable key={item.id} onPress={() => handleAddToCollection(item.id)} style={styles.dropdownButton}>
                                <Text style={{ color: Palette.softDove, fontWeight: 700, margin: 5, }}>{item.name}</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setIsModalVisible(true)}>
                            <Text style={{ color: Palette.softDove, fontWeight: 700, }}>+ New Collection</Text>
                        </Pressable>
                    </View>
                )}
                <Modal visible={isModalVisible} transparent animationType='fade'>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: '80%' }}>
                            <Text>Collection Name: </Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setCollectionName(value)}
                                value={collectionName}
                                placeholder="Eg. Favorites..."
                                placeholderTextColor="#999"
                            />
                            <Pressable onPress={() => setIsModalVisible(false)}>
                                <Text>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={() => { handleCreateCollection(); setIsModalVisible(false); }}>
                                <Text>Create</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    poster: {
        width: 250,
        height: 350,
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 5,
        color: Palette.spicedHotChocolate,
    },
    year: {
        fontSize: 16,
        color: Palette.softDove,
        textAlign: 'center',
        fontWeight: 700, 
    },
    input: {
        justifyContent: "center",
        alignItems: "stretch",
        borderWidth: 2,
        height: undefined,
        minHeight: 50,
        borderColor: Palette.spicedHotChocolate,
        padding: 5,
    },
    meta: {
        fontSize: 14,
        color: Palette.blackRaspberry,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    meta1: {
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 16,
        fontFamily: 'Courier',
        color: Palette.spicedHotChocolate,
        fontWeight: 600, 
    },
    meta2: {
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 16,
        fontFamily: 'Courier',
        color: Palette.softDove,
        fontWeight: 600, 
    },
    castContainer: {
        minHeight: 150,
        paddingVertical: 10,
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
        backgroundColor: Palette.softDove,
        borderWidth: 2,
        borderColor: Palette.darkSienna,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
    watchButton: {
        backgroundColor: Palette.blackRaspberry,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
    collectionButton: {
        padding: 10,
        backgroundColor: Palette.darkSienna,
        borderColor: Palette.softDove, 
        borderWidth: 1,
        borderRadius: 10,
        margin: 10,
        marginBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    collectionButton1: {
        padding: 10,
        backgroundColor: Palette.darkSienna,
        borderWidth: 1,
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        margin: 10,
        marginBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    dropdown: {
        padding: 10,
        backgroundColor: Palette.darkSienna,
        borderWidth: 1,
        margin: 10,
        marginTop: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingTop: 0,
    },
    dropdownButton: {
        padding: 5,
    },
})
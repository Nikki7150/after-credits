import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput, Image } from 'react-native';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { IMAGE_BASE_URL } from '@/lib/tmdb';
import Icon from 'react-native-ico-material-design';

export default function CollectionsScreen() {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [collectionsList, setCollectionsList] = useState<any[]>([]);
    const [collectionName, setCollectionName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [posters, setPosters] = useState<any[]>([]);
    const [allPosters, setAllPosters] = useState<any[]>([]);

    const fetchShows = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('shows')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching shows:', error);
            } else if (data) {
                setShows(data || []);
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setLoading(false);
        }
    }, []);

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

    const fetchPosterPerCollection = useCallback (async () => {
        const { data, error } = await supabase
            .from('collection_shows')
            .select('collection_id, shows(poster_path)');
        if (error) console.error('Error fetching show posters: ', error);
        else {
            setPosters(data || []);
        }
    }, []);

    const fetchPosterAllShows = useCallback (async () => {
        const { data, error } = await supabase
            .from('shows')
            .select('id, poster_path');
        if (error) console.error('Error fetching show posters: ', error);
        else {
            setAllPosters(data || []);
        }
    },[]);

    useFocusEffect(
        useCallback(() => {
            fetchShows();
            fetchCollections();
            fetchPosterPerCollection();
            fetchPosterAllShows();
        }, [fetchShows, fetchCollections, fetchPosterPerCollection, fetchPosterAllShows])
    );

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

    const paddedCollections =
    collectionsList.length % 2 !== 0
        ? [...collectionsList, { id: 'placeholder', isPlaceholder: true }]
        : collectionsList;

    const groupedByCollection = posters.reduce((acc, row) => {
        const collectionId = row.collection_id;
        const posterPath = row.shows?.poster_path;
        if (!acc[collectionId]) {
            acc[collectionId] = [];
        }
        if (posterPath) {
            acc[collectionId].push(posterPath);
        }
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedText type="title" style={{ color: Palette.softDove, fontFamily: 'RockSalt_400Regular', lineHeight: 80, paddingTop: 5, height: 60, }}>Collections</ThemedText>
            <Pressable 
                onPress={() => {
                    fetchShows();
                    fetchCollections();
                    fetchPosterPerCollection();
                }} 
                style={{ alignSelf: 'flex-end', padding: 8, position: 'absolute', top: 100, right: 20, }}
            >
                <Icon name="refresh-button" width={20} height={20} color={Palette.softDove} />
            </Pressable>
            {loading && <ThemedText type="subtitle" style={{ color: Palette.blackRaspberry, fontFamily: 'ReenieBeanie_400Regular', }}>Refreshing...</ThemedText>}
            <Link href={`/collections/all`} asChild>
                <Pressable>
                    <View style={[styles.shelfSquare, { flexDirection: 'row', overflow: 'hidden', aspectRatio: 2.3, alignItems: 'center', padding: 5 }]}>
                        {allPosters.slice(0, 25).map((row: any, index: any) => (
                            <Image
                                key={index}
                                source={{ uri: `${IMAGE_BASE_URL}${row.poster_path}` }}
                                style={{ flex: 1, height: '90%', borderWidth: 2, borderColor: Palette.moonRock, borderRadius: 2 }}
                                resizeMode="cover"
                            />
                        ))}
                    </View>
                    <Text style={styles.shelfLabel}>
                        All Shows
                    </Text>
                </Pressable>
            </Link>
            <FlatList
                data={paddedCollections}
                numColumns={2}
                columnWrapperStyle={{ gap: 28, paddingHorizontal: 12 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    if (item.isPlaceholder) {
                        return <View style={{ flex: 1 }} />;
                    }
                    const posters = groupedByCollection[item.id] ?? [];
                    return (
                        <Link href={`/collection/${item.id}`} asChild style={{ flex: 1 }}>
                            <Pressable style={{ marginBottom: 20 }}>
                                <View style={[styles.shelfSquare, { flexDirection: 'row', overflow: 'hidden', alignItems: 'center', padding: 5 }]}>
                                    {posters.slice(0, 15).map((posterPath: any, index: any) => (
                                        <Image
                                            key={index}
                                            source={{ uri: `${IMAGE_BASE_URL}${posterPath}` }}
                                            style={{ flex: 1, height: '90%', borderWidth: 2, borderColor: Palette.moonRock, borderRadius: 2 }}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </View>
                                <Text style={styles.shelfLabel}>{item.name}</Text>
                            </Pressable>
                        </Link>
                    );
                }}
            />
            <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.meta}>+</Text>
            </Pressable>
            <Modal visible={isModalVisible} transparent animationType='fade'>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: Palette.softDove, padding: 20, borderRadius: 12, width: '80%' }}>
                        <Text style={{ fontFamily: 'JimNightshade_400Regular', fontSize: 30, color: Palette.darkSienna, }}>Collection Name: </Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(value) => setCollectionName(value)}
                            value={collectionName}
                            placeholder="Eg. Favorites..."
                            placeholderTextColor="#999"
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 30, margin: 5 }}>
                            <Pressable onPress={() => setIsModalVisible(false)} style={[styles.modalButtons, {backgroundColor: Palette.softDove}]}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={() => { handleCreateCollection(); setIsModalVisible(false); }} style={styles.modalButtons}>
                                <Text style={{ fontFamily: 'RockSalt_400Regular' }}>Create</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.four,
        gap: Spacing.three,
        paddingBottom: Spacing.one - 15,
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        width: '100%',
        backgroundColor: Palette.spicedHotChocolate,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: Palette.moonRock,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        bottom: 25,
        right: -350,
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
    },
    meta: {
        fontSize: 30,
        textAlign: 'center',
        marginTop: 5,
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
    },
    shelfSquare: {
        aspectRatio: 1,
        backgroundColor: Palette.moonRock,
        borderRadius: 12,
    },
    shelfLabel: {
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '600',
        fontFamily: 'RockSalt_400Regular',
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
})
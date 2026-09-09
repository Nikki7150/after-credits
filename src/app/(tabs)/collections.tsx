import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { LANGUAGE_NAMES } from '@/lib/languages';

export default function CollectionsScreen() {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [collectionsList, setCollectionsList] = useState<any[]>([]);
    const [collectionName, setCollectionName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchShows = useCallback(async () => {
        console.log('fetchshows: starting');
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

    useFocusEffect(
        useCallback(() => {
        fetchShows();
        fetchCollections();
        }, [fetchShows, fetchCollections])
    );

    const grouped = shows.reduce((acc, show) => {
        const lang = show.language ?? 'unknown';
        if (!acc[lang]) {
            acc[lang] = [];
        }
        acc[lang].push(show);
        return acc;
    }, {} as Record<string, any[]>);

    const languageGroups = Object.entries(grouped) as [string, any[]][];

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
            console.log('Show saved successfully');
            setCollectionName('');
            fetchCollections();
        }
    };

    return (
        <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}>
            <FlatList<[string, typeof shows]>
                data={languageGroups}
                keyExtractor={([lang]) => lang}
                renderItem={({ item: [lang, showsInLang] }) => (
                    <Link href={`/collections/${lang}`} asChild>
                        <Pressable>
                            <View style={{ paddingVertical: 12 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                                    {LANGUAGE_NAMES[lang] ?? lang} ({showsInLang.length})
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                )}
            />
            <FlatList
                data={collectionsList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Link href={`/collection/${item.id}`} asChild>
                        <Pressable>
                            <View style={{ paddingVertical: 12 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                                    {item.name}
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                )}
            />
            <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.meta}>+</Text>
            </Pressable>
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
        </View>
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
    addButton: {
        backgroundColor: 'pink',
        width: 30,
        height: 30,
        borderRadius: 15,
        textAlign: 'center',
    },
    meta: {
        fontSize: 20,
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
})
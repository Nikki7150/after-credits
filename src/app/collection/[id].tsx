import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList, Modal, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import { ShowListItem } from "@/components/show-list-item";
import Icon from 'react-native-ico-material-design';

export default function ShowCollectionDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [shows, setShows] = useState<any>(null);
    const [text, setText] = useState('');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [collectionName, setCollectionName] = useState('');

    const fetchShows = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collection_shows')
                .select('shows(*)')
                .eq('collection_id', id); 
            if (error) {
                console.error('Error fetching shows:', error);
            } else if (data) {
                const showsOnly = data.map((row: any) => row.shows);
                setShows(showsOnly);
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchCollectionName = async () => {
            const { data, error } = await supabase
                .from('collections')
                .select('name')
                .eq('id', id)
                .single();
            if (error) console.error('Error fetching collection name: ', error);
            else if (data) {
                setCollectionName(data.name);
            }
        };
        fetchCollectionName();
    }, [id]);

    useEffect(() => {
        fetchShows();
    }, [fetchShows]);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleRemoveFromCollection = async (showId: string) => {
        const { error } = await supabase
            .from('collection_shows')
            .delete()
            .eq('collection_id', id)
            .eq('show_id', showId);
        if (error) {
            console.error('error deleting from watchlist: ', error);
        } else {
            fetchShows();
        }
    };

    const handleRemoveCollection = async (collectionId: string) => {
        Alert.alert(
            'Delete Collection',
            'Are you sure you want to delete this collection? This action is permanent.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                    const { error } = await supabase
                        .from('collections')
                        .delete()
                        .eq('id', collectionId);
                    if (error) {
                        console.error('Error deleting collection:', error);
                    } else {
                        router.back();
                    }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <Pressable onPress={() => router.back()}>
                    <Text>Back</Text>
                </Pressable>
                <Text style={{ fontSize: 20, fontWeight: '500', }}>{collectionName}</Text>
                <Pressable onPress={() => setIsMenuVisible(true)}>
                    <Text style={{ fontSize: 25, fontWeight: 200, }}>⋮</Text>
                </Pressable>
            </View>
            <Modal visible={isMenuVisible} transparent animationType="fade">
                <Pressable style={{ flex: 1, backgroundColor: 'transparent' }} onPress={() => setIsMenuVisible(false)}>
                    <View style={{ position: 'absolute', top: 70, right: 30, backgroundColor: 'white', borderRadius: 8, padding: 10, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)' }}>
                        <Pressable onPress={() => handleRemoveCollection(id)}>
                            <Text style={{ color: 'red' }}> <Icon name="rubbish-bin-delete-button" height={13} width={13} color='red' /> Delete Collection</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            {loading && <Text>Loading...</Text>}
            <FlatList
                data={shows}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', gap: 10, padding: 10, alignItems: 'center', }}>
                        <Link href={`/show/${item.id}`} asChild style={{ flex: 1 }}>
                            <Pressable>
                                <ShowListItem
                                    title={item.title}
                                    year={item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                                    posterPath={item.poster_path}
                                />
                            </Pressable>
                        </Link>
                        <Pressable onPress={() => handleRemoveFromCollection(item.id)}>
                            <Text style={{ color: 'red' }}> <Icon name="rubbish-bin-delete-button" height={13} width={13} color='red' /></Text>
                        </Pressable>
                    </View>
                )}
            />
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
})
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList, Modal, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import { ShowListItem } from "@/components/show-list-item";
import Icon from 'react-native-ico-material-design';
import { Palette } from "@/constants/theme";

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
                    <Text style={{ color: Palette.spicedHotChocolate, fontWeight: 500, fontSize: 20, }}>く</Text>
                </Pressable>
                <Text style={{ color: Palette.moonRock, fontSize: 20, fontWeight: 500, fontFamily: 'RockSalt_400Regular', lineHeight: 35, }}>{collectionName}</Text>
                <Pressable onPress={() => setIsMenuVisible(true)}>
                    <Text style={{ color: Palette.spicedHotChocolate, fontSize: 25, }}>⋮</Text>
                </Pressable>
            </View>
            <Modal visible={isMenuVisible} transparent animationType="fade">
                <Pressable style={{ flex: 1, backgroundColor: 'transparent' }} onPress={() => setIsMenuVisible(false)}>
                    <View style={{ position: 'absolute', top: 70, right: 30, backgroundColor: Palette.moonRock, borderRadius: 8, padding: 10, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)' }}>
                        <Pressable onPress={() => handleRemoveCollection(id)}>
                            <Text style={{ color: Palette.darkSienna, fontWeight: 500, fontFamily: 'ReenieBeanie_400Regular', fontSize: 25, }}> <Icon name="rubbish-bin-delete-button" height={13} width={13} color={Palette.darkSienna} /> Delete Collection</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            {loading && <Text style={{ color: Palette.softDove, fontFamily: 'ReenieBeanie_400Regular', fontSize: 20, }}>Loading...</Text>}
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
                                    page="search"
                                />
                            </Pressable>
                        </Link>
                        <Pressable onPress={() => handleRemoveFromCollection(item.id)}>
                            <Text style={{ backgroundColor: Palette.darkSienna, padding: 10, paddingTop: 15, borderRadius: 5, }}><Icon name="rubbish-bin-delete-button" height={13} width={13} color={Palette.moonRock} /></Text>
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
        backgroundColor: Palette.blackRaspberry,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
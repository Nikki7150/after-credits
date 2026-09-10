import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList } from "react-native";
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

    return (
        <SafeAreaView style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text>Back</Text>
            </Pressable>
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
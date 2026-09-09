import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import { ShowListItem } from "@/components/show-list-item";

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
                    <Link href={`/show/${item.id}`} asChild>
                        <Pressable>
                            <ShowListItem
                                title={item.title}
                                year={item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                                posterPath={item.poster_path}
                            />
                        </Pressable>
                    </Link>
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
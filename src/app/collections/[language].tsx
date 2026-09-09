import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image, TextInput, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LANGUAGE_NAMES } from "@/lib/languages";

import { supabase } from "@/lib/supabase";
import { getShowDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import { ShowListItem } from "@/components/show-list-item";

export default function ShowLanguageBucket() {
    const { language } = useLocalSearchParams<{ language: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [shows, setShows] = useState<any[]>([]);

    useEffect(() => {
        const fetchShowsByLanguage = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('shows')
                    .select('*')
                    .eq('language', language)
                    .order('created_at', { ascending: false });
                if (error) {
                    console.error('Error fetching shows:', error);
                } else if (data) {
                    setShows(data || []);
                }
            } catch (err) {
                console.error("Error fetching show details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShowsByLanguage();
    }, [language]);

    return (
        <SafeAreaView style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text>Back</Text>
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
                {LANGUAGE_NAMES[language ?? ''] ?? language}
            </Text>
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
import { View, Text, FlatList, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { LANGUAGE_NAMES } from '@/lib/languages';

export default function CollectionsScreen() {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
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
    useFocusEffect(
        useCallback(() => {
        fetchShows();
        }, [fetchShows])
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
        </View>
    );
}
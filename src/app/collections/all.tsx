import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { LANGUAGE_NAMES } from '@/lib/languages';
import { ShowListItem } from '@/components/show-list-item';
import Icon from 'react-native-ico-material-design';

export default function CollectionsScreen() {
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [collectionsList, setCollectionsList] = useState<any[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string |null>(null);

    const filteredShows = selectedLanguage ? shows.filter((show) => (show.language ?? 'unknown') === selectedLanguage) : shows;

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
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <Pressable onPress={() => router.back()}>
                    <Text>Back</Text>
                </Pressable>
                {/* <Pressable onPress={() => setIsMenuVisible(true)}>
                    <Text style={{ fontSize: 25, fontWeight: 200, }}>⋮</Text>
                </Pressable> */}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10, }}>
                <Pressable onPress={() => setSelectedLanguage(null)}>
                    <View style={[styles.filters, selectedLanguage === null && styles.filtersActive]}>
                        <Text style={{ fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                            All ({shows.length})
                        </Text>
                    </View>
                </Pressable>
                <FlatList<[string, typeof shows]>
                    style={{ flexGrow: 0 }}
                    data={languageGroups}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={([lang]) => lang}
                    renderItem={({ item: [lang, showsInLang] }) => (
                        <Pressable onPress={() => setSelectedLanguage(lang)}>
                            <View style={[styles.filters, selectedLanguage === lang && styles.filtersActive]}>
                                <Text style={{ fontSize: 15, fontWeight: 'semibold', textAlign: 'center', }}>
                                    {LANGUAGE_NAMES[lang] ?? lang} ({showsInLang.length})
                                </Text>
                            </View>
                        </Pressable>
                    )}
                />
            </View>
            <FlatList
            style={{ flex: 1 }}
                data={filteredShows}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', gap: 10, padding: 10, alignItems: 'center', }}>
                        <Link href={`/show/${item.id}`} asChild style={{ flex: 1 }}>
                            <Pressable>
                                <ShowListItem
                                    title={item.title}
                                    year={item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                                    posterPath={item.poster_path}
                                    page='watchlist'
                                />
                            </Pressable>
                        </Link>
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
    filters: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'grey',
        margin: 5,
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        height: 30,
    },
    filtersActive: {
        backgroundColor: 'rgba(185, 144, 144, 1)',
        borderWidth: 1,
        borderColor: 'grey',
        margin: 5,
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
})
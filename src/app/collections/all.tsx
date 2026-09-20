import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { LANGUAGE_NAMES } from '@/lib/languages';
import { ShowListItem } from '@/components/show-list-item';
import Icon from 'react-native-ico-material-design';
import { Palette } from '@/constants/theme';

export default function CollectionsScreen() {
    const [shows, setShows] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [active, setActive] = useState<'want_to_watch' | 'watched' | null>(null);

    const filteredShows = selectedLanguage ? shows.filter((show) => (show.language ?? 'unknown') === selectedLanguage) : shows;

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
                setResults(data);
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

    useEffect(() => {
        const searchTerm = query.trim().toLowerCase();
        if (!searchTerm) {
            setResults(shows);
            fetchShows();
            return;
        }
        const filtered = shows.filter((show) => (show.title || ' ').toLowerCase().includes(searchTerm));
        setShows(filtered);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        setShows([]);
    };

    useEffect(() => {
        const filterStatus = active;
        if (active == null) {
            setResults(shows);
            fetchShows();
            return;
        }
        const filtered = shows.filter((show) => (show.status).includes(filterStatus));
        setShows(filtered);
    }, [active]);

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
                    <Text style={{ color: Palette.softDove, fontWeight: 500, fontSize: 20, }}>く</Text>
                </Pressable>
            </View>
            <View style={styles.search}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    placeholder="Search for shows..."
                    style={styles.searchInput}
                    value={query}
                    onChangeText={(text) => setQuery(text)}
                    placeholderTextColor={Palette.spicedHotChocolate}
                />
                {query.length > 0 && (
                    <Pressable onPress={handleClear}>
                        <Text style={styles.searchClear}>ㄨ</Text>
                    </Pressable>
                )}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10, }}>
                <Pressable onPress={() => setSelectedLanguage(null)}>
                    <View style={[styles.filters, selectedLanguage === null && styles.filtersActive]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', textAlign: 'center', fontFamily: 'RockSalt_400Regular', lineHeight: 20, }}>
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
                                <Text style={{ fontSize: 10, fontWeight: 'semibold', textAlign: 'center', fontFamily: 'RockSalt_400Regular', lineHeight: 20, }}>
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
                                    page='search'
                                />
                            </Pressable>
                        </Link>
                    </View>
                )}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 40, alignItems: 'center', }}>
                <Pressable onPress={() => setActive('want_to_watch')}>
                    <Text style={active == 'want_to_watch' ? styles.tabsActive : styles.tabs}>Want to Watch</Text>
                </Pressable>
                <Pressable onPress={() => setActive('watched')}>
                    <Text style={active == 'watched' ? styles.tabsActive : styles.tabs}>Watched</Text>
                </Pressable>
                <Pressable onPress={() => setActive(null)}>
                    <Text style={styles.tabs}>X</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: Palette.blackRaspberry,
    },
    filters: {
        backgroundColor: Palette.softDove,
        borderWidth: 1,
        borderColor: Palette.moonRock,
        margin: 5,
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        height: 30,
    },
    filtersActive: {
        backgroundColor: Palette.spicedHotChocolate,
        borderWidth: 1,
        borderColor: Palette.moonRock,
        margin: 5,
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    search: { 
        flexDirection: 'row', 
        gap: 10, 
        alignItems: 'center',
        backgroundColor: Palette.blackRaspberry,
        borderWidth: 1,
        borderColor: Palette.spicedHotChocolate,
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 10,
    },
    searchIcon: {
        fontSize: 40,
        color: Palette.moonRock,
    },
    searchInput: {
        width: '80%',
        fontSize: 27,
        color: Palette.moonRock,
        fontFamily: 'ReenieBeanie_400Regular',
    },
    searchClear: {
        fontSize: 25,
        color: Palette.moonRock,
    },
    tabs: { 
        color: Palette.moonRock, 
        fontFamily: 'ReenieBeanie_400Regular', 
        fontSize: 30, 
        marginTop: 20,
        padding: 5, 
    },
    tabsActive: { 
        color: Palette.softDove, 
        fontFamily: 'ReenieBeanie_400Regular', 
        fontSize: 30, 
        textDecorationLine: 'underline', 
        marginTop: 20, 
        padding: 5,
        borderRadius: 10,
    },
})
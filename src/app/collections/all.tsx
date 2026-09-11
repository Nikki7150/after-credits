import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { LANGUAGE_NAMES } from '@/lib/languages';
import { ShowListItem } from '@/components/show-list-item';
import Icon from 'react-native-ico-material-design';

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                <Pressable onPress={() => router.back()}>
                    <Text>Back</Text>
                </Pressable>
                {/* <Pressable onPress={() => setIsMenuVisible(true)}>
                    <Text style={{ fontSize: 25, fontWeight: 200, }}>⋮</Text>
                </Pressable> */}
            </View>
            <FlatList<[string, typeof shows]>
                data={languageGroups}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={([lang]) => lang}
                renderItem={({ item: [lang, showsInLang] }) => (
                    <View style={styles.filters}>
                        <Link href={`/collections/${lang}`} asChild>
                            <Pressable>
                                <Text style={{ fontSize: 15, fontWeight: 'semibold', textAlign: 'center', }}>
                                    {LANGUAGE_NAMES[lang] ?? lang} ({showsInLang.length})
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                )}
            />
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
                        <Pressable>
                            <Text style={{ color: 'red' }}> <Icon name="rubbish-bin-delete-button" height={13} width={13} color='red' /></Text>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    filters: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'grey',
        margin: 5,
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
    }
})
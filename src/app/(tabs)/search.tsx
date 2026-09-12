import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { IMAGE_BASE_URL, searchShows } from '@/lib/tmdb';
import { supabase } from '@/lib/supabase';
import { ShowListItem } from '@/components/show-list-item';
import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

export default function SearchScreen() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await searchShows(query);
            const filteredResults = res.filter((item: { media_type: string; }) => item.media_type === 'movie' || item.media_type === 'tv');
            setResults(filteredResults);
        } catch (error) {
            console.error('Error searching shows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (item: any) => {
        // 1. get the current user id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No user found');
            return;
        }
        // 2. call supabase.from('shows').insert({...}) with the right fields mapped from item
        const { error } = await supabase.from('shows').insert({
            user_id: user.id,
            title: item.title || item.name,
            release_date: item.release_date || item.first_air_date,
            poster_path: item.poster_path,
            media_type: item.media_type,
            tmdb_id: item.id,
            language: item.original_language,
        });
        // 3. log or alert success/failure
        if (error) {
            console.error('Error saving show:', error);
        } else {
            console.log('Show saved successfully');
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedText type="title" style={{ color: Palette.moonRock, fontFamily: 'RockSalt_400Regular', lineHeight: 80, paddingLeft: 5, paddingTop: 5, height: 60, }}>Search</ThemedText>
            <View style={styles.search}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    placeholder="Search for shows..."
                    style={styles.searchInput}
                    value={query}
                    onChangeText={(text) => setQuery(text)}
                    onSubmitEditing={() => {handleSearch()}}
                />
                {query.length > 0 && (
                    <Pressable onPress={handleClear}>
                        <Text style={styles.searchClear}>ㄨ</Text>
                    </Pressable>
                )}
            </View>
            {loading && <Text>Loading...</Text>}
            <FlatList
                data={results}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', gap: 10, padding: 10, alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ShowListItem
                                title={item.media_type === 'movie' ? item.title : item.name}
                                year={
                                    item.media_type === 'movie'
                                        ? (item.release_date === '' ? 'TBA' : item.release_date.split('-')[0])
                                        : (item.first_air_date === '' ? 'TBA' : item.first_air_date.split('-')[0])
                                }
                                posterPath={item.poster_path}
                                page='search'
                            />
                        </View>
                        <Pressable onPress={() => handleSave(item)} style={{ padding: 10, backgroundColor: 'lightgray', borderRadius: 5, marginLeft: 'auto' }}>
                            <Text>+</Text>
                        </Pressable>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.four,
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        width: '100%',
        backgroundColor: Palette.darkSienna,
    },
    search: { 
        flexDirection: 'row', 
        gap: 10, 
        alignItems: 'center',
        backgroundColor: Palette.softDove,
        borderWidth: 1,
        borderColor: Palette.moonRock,
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    searchIcon: {
        fontSize: 40,
        color: Palette.spicedHotChocolate,
    },
    searchInput: {
        width: '80%',
        fontSize: 17,
        color: Palette.spicedHotChocolate,
    },
    searchClear: {
        fontSize: 25,
        color: Palette.spicedHotChocolate,
    }
});
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import { useState } from 'react';
import { searchShows } from '@/lib/tmdb';
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
    return (
        <View style={styles.container}>
            <Text>Search - Coming soon</Text>
            <TextInput
                placeholder="Search for shows..."
                style={styles.textInput}
                value={query}
                onChangeText={(text) => setQuery(text)}
                onSubmitEditing={() => {
                    handleSearch();
                }}
            />
            <Pressable onPress={() => {
                handleSearch();
            }}>
                <Text>Search</Text>
            </Pressable>
            {loading && <Text>Loading...</Text>}
            <FlatList
                data={results}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.media_type === 'movie' ? item.title : item.name}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginTop: 20,
        width: '80%',
    },
});
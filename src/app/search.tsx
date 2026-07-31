import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { IMAGE_BASE_URL, searchShows } from '@/lib/tmdb';
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
                    <View style={{ flexDirection: 'row', gap: 10, padding: 10 }}>
                        {item.poster_path &&
                            <Image 
                                source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} 
                                style={{ width: 60, height: 90 }} 
                            />
                        }
                        <View>
                            <Text>{item.media_type === 'movie' ? item.title : item.name}</Text>
                            <Text>{item.media_type === 'movie' ? (item.release_date === '' ? 'TBA' : item.release_date.split('-')[0]) : (item.first_air_date === '' ? 'TBA' : item.first_air_date.split('-')[0])}</Text>
                        </View>
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
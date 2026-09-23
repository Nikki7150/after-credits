import * as Device from 'expo-device';
import { FlatList, Platform, Pressable, StyleSheet, TextInput, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState, useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ShowListItem } from '@/components/show-list-item';
import { Palette } from '@/constants/theme';
import Icon from 'react-native-ico-material-design';
import AnimatedShowItem from '@/components/animated-show-item';

export default function WatchlistScreen() {
  const [results, setResults] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetchShows = useCallback(async () => {
    setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shows')
          .select('*')
          .eq('status', 'want_to_watch')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching shows:', error);
        } else if (data) {
          setShows(data);
          setResults(data || []);
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
    setResults(filtered);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleToggle = async (item: any) => {
    const newStatus = item.status === 'want_to_watch' ? 'watched' : 'want_to_watch';
    const { error } = await supabase
      .from('shows')
      .update({ status: newStatus })
      .eq('id', item.id);
    if (error) console.error('error updating status: ', error);
  };

  const handleRemove = (id: string) => {
    setResults((prevResults) => prevResults.filter((show) => show.id !== id));
    setShows((prevShows) => prevShows.filter((show) => show.id !== id));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={{ color: Palette.darkSienna, fontFamily: 'RockSalt_400Regular', lineHeight: 80, paddingTop: 5, height: 60, }}>Watchlist</ThemedText>
        <Pressable onPress={fetchShows} style={{ alignSelf: 'flex-end', padding: 8, position: 'absolute', top: 100, right: 20, }}>
          <Icon name="refresh-button" width={20} height={20} color={Palette.darkSienna} />
        </Pressable>
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            placeholder="Search for shows..."
            style={styles.searchInput}
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear}>
              <Text style={styles.searchClear}>ㄨ</Text>
            </Pressable>
          )}
        </View>
        {loading && <ThemedText type="subtitle" style={{ color: Palette.blackRaspberry, fontFamily: 'ReenieBeanie_400Regular', }}>Refreshing...</ThemedText>}
        {results.length > 0 ? (
          <FlatList
            style={{ flex: 1, alignSelf: 'stretch' }}
            data={results}
            refreshing={loading}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AnimatedShowItem item={item} onToggle={handleToggle} onRemove={handleRemove} />
            )}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 30, fontFamily: 'ReenieBeanie_400Regular', lineHeight: 30, color: Palette.darkSienna }}>
              The credits haven't rolled yet.
            </ThemedText>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.softDove,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
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
    fontSize: 27,
    color: Palette.spicedHotChocolate,
    fontFamily: 'ReenieBeanie_400Regular',
  },
  searchClear: {
    fontSize: 25,
    color: Palette.spicedHotChocolate,
  },
});

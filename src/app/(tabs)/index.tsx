import * as Device from 'expo-device';
import { FlatList, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ShowListItem } from '@/components/show-list-item';
import { Palette } from '@/constants/theme';

export default function WatchlistScreen() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShows = useCallback(async () => {
    console.log('fetchshows: starting');
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={{ color: Palette.darkSienna, }}>Watchlist</ThemedText>
        <ThemedText type="small" style={{ color: Palette.spicedHotChocolate, }}>Want to Watch</ThemedText>
        {loading && <ThemedText type="small" style={{ color: Palette.blackRaspberry, }}>Refreshing...</ThemedText>}
        <FlatList
          style={{ flex: 1, alignSelf: 'stretch' }}
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Link href={`/show/${item.id}`} asChild>
              <Pressable>
                <ShowListItem
                  title={item.title}
                  year={item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                  posterPath={item.poster_path}
                  page='watchlist'
                />
              </Pressable>
            </Link>
          )}
        />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});

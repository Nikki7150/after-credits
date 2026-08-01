import * as Device from 'expo-device';
import { FlatList, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function WatchlistScreen() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        <ThemedText type="title">Watchlist</ThemedText>
        <ThemedText type="small">Want to Watch</ThemedText>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThemedText type="smallBold">{item.title}</ThemedText>
          )}
          refreshing={loading}
          onRefresh={() => {fetchShows()}}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});

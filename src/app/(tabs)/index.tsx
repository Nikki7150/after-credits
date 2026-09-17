import * as Device from 'expo-device';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router'; // runs every time screen in focus
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ShowListItem } from '@/components/show-list-item';
import { Palette } from '@/constants/theme';
import Icon from 'react-native-ico-material-design';

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
        <ThemedText type="title" style={{ color: Palette.darkSienna, fontFamily: 'RockSalt_400Regular', lineHeight: 80, paddingTop: 5, height: 60, }}>Watchlist</ThemedText>
        <Pressable onPress={fetchShows} style={{ alignSelf: 'flex-end', padding: 8, position: 'absolute', top: 100, right: 20, }}>
          <Icon name="refresh-button" width={20} height={20} color={Palette.darkSienna} />
        </Pressable>
        {loading && <ThemedText type="subtitle" style={{ color: Palette.blackRaspberry, fontFamily: 'ReenieBeanie_400Regular', }}>Refreshing...</ThemedText>}
        {results.length > 0 ? (
          <FlatList
            style={{ flex: 1, alignSelf: 'stretch' }}
            data={results}
            refreshing={loading}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});

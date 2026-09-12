import { Palette } from "@/constants/theme";
import { IMAGE_BASE_URL } from "@/lib/tmdb";
import { Image, StyleSheet, Text, View } from "react-native";

type ShowListItemProps = {
    title: string;
    year: string;
    posterPath: string | null;
    page: string;
};

export function ShowListItem({ title, year, posterPath, page }: ShowListItemProps) {
    return (
        <View style={styles.container}>
        {posterPath ? (
            <Image
            source={{ uri: `${IMAGE_BASE_URL}${posterPath}` }}
            style={styles.poster}
            />
        ) : (
            <View style={styles.poster} />
        )}
        <View style={styles.info}>
            <Text style={page == 'watchlist' ? styles.title : styles.title2}>{title}</Text>
            <Text style={page == 'watchlist' ? styles.year : styles.year2}>{year}</Text>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 10,
        padding: 10,
    },
    poster: {
        width: 80,
        height: 110,
        borderRadius: 6,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: 600,
        color: Palette.blackRaspberry,
        fontFamily: 'JimNightshade_400Regular',
    },
    title2: {
        fontSize: 26,
        fontWeight: 600,
        color: Palette.softDove,
        fontFamily: 'JimNightshade_400Regular',
    },
    year: {
        marginTop: 4,
        fontSize: 24,
        color: Palette.spicedHotChocolate,
        fontFamily: 'JimNightshade_400Regular',
    },
    year2: {
        marginTop: 4,
        fontSize: 24,
        color: Palette.moonRock,
        fontFamily: 'JimNightshade_400Regular',
    },
});

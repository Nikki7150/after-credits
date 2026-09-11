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
        width: 60,
        height: 90,
        borderRadius: 6,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: Palette.blackRaspberry,
    },
    title2: {
        fontSize: 16,
        fontWeight: 600,
        color: Palette.softDove,
    },
    year: {
        marginTop: 4,
        fontSize: 14,
        color: Palette.spicedHotChocolate,
    },
    year2: {
        marginTop: 4,
        fontSize: 14,
        color: Palette.moonRock,
    },
});

import { IMAGE_BASE_URL } from "@/lib/tmdb";
import { Image, StyleSheet, Text, View } from "react-native";

type ShowListItemProps = {
    title: string;
    year: string;
    posterPath: string | null;
};

export function ShowListItem({ title, year, posterPath }: ShowListItemProps) {
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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.year}>{year}</Text>
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
        fontWeight: "600",
    },
    year: {
        marginTop: 4,
        fontSize: 14,
        color: "#6b7280",
    },
});

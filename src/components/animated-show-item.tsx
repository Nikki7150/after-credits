import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    LinearTransition,
    runOnJS,
    useAnimatedStyle,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Link } from 'expo-router';
import { ShowListItem } from './show-list-item';
import { scheduleOnRN } from 'react-native-worklets';

const SPARKLE_COUNT = 6;
const SPARKLE_DISTANCE = 30;

interface AnimatedShowItemProps {
    item: any;
    onToggle: (item: any) => void;
    onRemove: (id: string) => void;
}

export default function AnimatedShowItem({ item, onToggle, onRemove }: AnimatedShowItemProps) {
    const [checked, setChecked] = useState(false);

    const checkboxStyle = useAnimatedStyle(() => ({
        transform: [
            {
            scale: withSequence(
                withTiming(checked ? 1.2 : 1, { duration: 100 }),
                withTiming(1, { duration: 100 })
            ),
            },
        ],
        backgroundColor: withTiming(checked ? '#4ADE80' : 'transparent', { duration: 200 }),
        borderColor: withTiming(checked ? '#4ADE80' : '#CBD5E1', { duration: 200 }),
    }));

    const checkmarkStyle = useAnimatedStyle(() => ({
        opacity: withTiming(checked ? 1 : 0, { duration: 150 }),
        transform: [{ scale: withTiming(checked ? 1 : 0.5, { duration: 150 }) }],
    }));

    const itemContainerStyle = useAnimatedStyle(() => {
        if (!checked) return {};
        return {
            transform: [
                { translateX: withDelay(300, withTiming(-400, { duration: 300 })) }
            ],
            height: withDelay(450, withTiming(0, { duration: 200 }, (finished) => {
                if (finished) {
                scheduleOnRN(onRemove, item.id);
                }
            })),
            marginVertical: withDelay(450, withTiming(0, { duration: 200 })),
            paddingVertical: withDelay(450, withTiming(0, { duration: 200 })),
            opacity: withDelay(400, withTiming(0, { duration: 200 })),
        };
    });

    const handlePress = () => {
        if (checked) return;
        setChecked(true);
        onToggle(item);
    };

    return (
        <Animated.View style={[styles.container, itemContainerStyle]} layout={LinearTransition}>
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.checkboxWrapper}>
                <Animated.View style={[styles.checkbox, checkboxStyle]}>
                    <Animated.Text style={[styles.checkmark, checkmarkStyle]}>✓</Animated.Text>
                </Animated.View>
            </TouchableOpacity>
            {
                <Link href={`/show/${item.id}`} asChild style={{ flex: 1, }}>
                    <Pressable>
                        <ShowListItem
                            title={item.title}
                            year={item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                            posterPath={item.poster_path}
                            page='watchlist'
                        />
                    </Pressable>
                </Link>
            }
        </Animated.View>
    );
}

    // --- SPARKLE SUB-COMPONENT ---
function Sparkle({ index }: { index: number }) {
    const angle = (index * 2 * Math.PI) / SPARKLE_COUNT;
    const targetX = Math.cos(angle) * SPARKLE_DISTANCE;
    const targetY = Math.sin(angle) * SPARKLE_DISTANCE;

    const sparkleStyle = useAnimatedStyle(() => {
        return {
        transform: [
            { translateX: withTiming(targetX, { duration: 400 }) },
            { translateY: withTiming(targetY, { duration: 400 }) },
            { scale: withTiming(0, { duration: 400 }) },
        ],
        opacity: withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 350 })
        ),
        };
    });

    return <Animated.View style={[styles.sparkle, sparkleStyle]} />;
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 12,
        height: 56, // Fixed height ensures smooth collapse transitions
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
        color: '#1E293B',
        marginLeft: 12,
    },
    textChecked: {
        textDecorationLine: 'line-through',
        color: '#94A3B8',
    },
    sparkle: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B', // Gold/Sparkle color
    },
});

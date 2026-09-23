import React, { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { Link } from 'expo-router';
import { ShowListItem } from './show-list-item';
import { scheduleOnRN } from 'react-native-worklets';
import { Palette } from '@/constants/theme';

interface AnimatedShowItemProps {
    item: any;
    onToggle: (item: any) => void;
    onRemove: (id: string) => void;
}

const SPARKLE_COUNT = 6;
const SPARKLE_DISTANCE = 30;

function Sparkle({ angle }: { angle: number }) {
    const progress = useSharedValue(0);

    const sparkleStyle = useAnimatedStyle(() => {
        const radians = (angle * Math.PI) / 180;
        return {
            opacity: withTiming(progress.value === 1 ? 0 : 1),
            transform: [
                { translateX: Math.cos(radians) * SPARKLE_DISTANCE * progress.value, },
                { translateY: Math.sin(radians) * SPARKLE_DISTANCE * progress.value, },
                { scale: withTiming(progress.value === 1 ? 1 : 0.3, { duration: 250 }), },
            ],
        };
    });

    React.useEffect(() => {
        progress.value = withTiming(1, { duration: 300 });
    }, []);

    return <Animated.Text style={[styles.sparkle, sparkleStyle]}>✦</Animated.Text>;
}

export default function AnimatedShowItem({ item, onToggle, onRemove, }: AnimatedShowItemProps) {
    const [checked, setChecked] = useState(false);

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const height = useSharedValue(0);

    const checkboxStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withTiming(checked ? 1.2 : 1, {
                    duration: 100,
                }),
            },
        ],
        backgroundColor: withTiming(
            checked ? Palette.darkSienna : 'transparent',
            { duration: 200 }
        ),
        borderColor: withTiming(
            checked ? Palette.darkSienna : Palette.moonRock,
            { duration: 200 }
        ),
    }));

    const checkmarkStyle = useAnimatedStyle(() => ({
        opacity: withTiming(checked ? 1 : 0, {
            duration: 150,
        }),
        transform: [
            {
                scale: withTiming(checked ? 1 : 0.5, {
                    duration: 150,
                }),
            },
        ],
    }));

    const itemStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
        opacity: opacity.value,
        height: height.value || undefined,
    }));

    const handlePress = () => {
        if (checked) return;
        setChecked(true);
        // Update Supabase
        onToggle(item);
        // Delay item transition to be able to see sparkle
        const SPARKLE_DELAY = 750;
        translateX.value = withDelay(
            SPARKLE_DELAY,
            withTiming(
                450,
                { duration: 350, },
                (finished) => {
                    if (finished) {
                        // Slide is COMPLETELY finished.
                        // Now fade out and collapse.
                        opacity.value = withTiming(0, {
                            duration: 100,
                        });
                        height.value = withTiming(
                            0,
                            {
                                duration: 250,
                            },
                            (heightFinished) => {
                                if (heightFinished) {
                                    scheduleOnRN(onRemove, item.id);
                                }
                            }
                        );
                    }
                }
            )
        );
    };

    return (
        <Animated.View
            style={[styles.container, itemStyle]}
            onLayout={(event) => {
                if (height.value === 0) {
                    height.value = event.nativeEvent.layout.height;
                }
            }}
        >
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.checkboxWrapper}>
                {checked && (
                    <>
                        <Sparkle angle={0} />
                        <Sparkle angle={60} />
                        <Sparkle angle={120} />
                        <Sparkle angle={180} />
                        <Sparkle angle={240} />
                        <Sparkle angle={300} />
                    </>
                )}
                <Animated.View style={[styles.checkbox, checkboxStyle]} >
                    <Animated.Text style={[styles.checkmark, checkmarkStyle]} >
                        ✓
                    </Animated.Text>
                </Animated.View>
            </TouchableOpacity>
            <Link
                href={`/show/${item.id}`}
                asChild
                style={{ flex: 1 }}
            >
                <Pressable>
                    <ShowListItem
                        title={item.title}
                        year={
                            item.release_date
                                ? item.release_date.split('-')[0]
                                : 'TBA'
                        }
                        posterPath={item.poster_path}
                        page="watchlist"
                    />
                </Pressable>
            </Link>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        padding: 0,
        marginVertical: 10,
        marginHorizontal: 6,
        borderRadius: 12,
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
        color: Palette.softDove,
        fontSize: 14,
        fontWeight: 'bold',
    },
    sparkle: {
        position: 'absolute',
        fontSize: 12,
        color: Palette.spicedHotChocolate,
    },
});

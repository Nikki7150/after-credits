const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';

export async function searchShows(query: string) {
    const response = await fetch(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
    {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            accept: 'application/json',
        },
        }
    );

    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }

    const json = await response.json();
    return json.results;
}
export interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type?: 'movie' | 'tv';
}

interface TmdbResponse {
    results: MediaItem[];
}

export async function fetchTrendingMovies(): Promise<MediaItem[]> {
    const res = await fetch('/api/Movie/movies/trending');
    if (!res.ok) throw new Error('Failed to load trending movies');
    const data: TmdbResponse = await res.json();
    return (data.results || []).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchTrendingSeries(): Promise<MediaItem[]> {
    const res = await fetch('/api/Movie/series/trending');
    if (!res.ok) throw new Error('Failed to load trending series');
    const data: TmdbResponse = await res.json();
    return (data.results || []).map(item => ({ ...item, media_type: 'tv' }));
}

export async function fetchTrendingAll(): Promise<MediaItem[]> {
    const [movies, series] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingSeries()
    ]);

    // Interleave movies and series evenly
    const combined: MediaItem[] = [];
    const maxLen = Math.max(movies.length, series.length);
    for (let i = 0; i < maxLen; i++) {
        if (movies[i]) combined.push(movies[i]);
        if (series[i]) combined.push(series[i]);
    }
    return combined;
}
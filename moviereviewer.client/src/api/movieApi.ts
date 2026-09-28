export interface TmdbMediaItem {
    id: number;
    media_type: string;
    title?: string;
    name?: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    genre_ids: number[];
    release_date?: string;
    first_air_date?: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string | null;
    runtime: number | null;
    vote_average: number;
    genres: Genre[];
}

export interface SeriesDetails {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string | null;
    number_of_seasons: number;
    number_of_episodes: number;
    episode_run_time: number[];
    vote_average: number;
    genres: { id: number; name: string }[];
}


export async function fetchTrendingMovies() : Promise<TmdbMediaItem[]> {
    const response = await fetch('/api/Movie/movies/trending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch trending movies.');
    }

    return response.json();
}

export async function fetchTrendingSeries() : Promise<TmdbMediaItem[]> {
    const response = await fetch('/api/Movie/series/trending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch trending series.');
    }

    return response.json();
}

export async function fetchTrendingMedia(): Promise<TmdbMediaItem[]> {
    const [movies, series] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingSeries()
    ]);

    return [...movies, ...series];
}

export async function fetchMediaByQuery(query: string, page: number = 1): Promise<TmdbMediaItem[]> {
    const sanitizedQuery = encodeURIComponent(query.trim());

    const response = await fetch(`/api/Movie/media/search/${sanitizedQuery}/${page}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            errorData?.error || `Failed to fetch media (Status ${response.status}: ${response.statusText})`
        );
    }

    return response.json();
}

export async function fetchMovieDetails(movieId: number): Promise<MovieDetails> {
    const response = await fetch(`api/Movie/movies/details/${movieId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            errorData?.error || `Failed to fetch movie details (Status ${response.status}: ${response.statusText})`
        );
    }

    return response.json();
}

export async function fetchSeriesDetails(movieId: number): Promise<SeriesDetails> {
    const response = await fetch(`api/Movie/series/details/${movieId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            errorData?.error || `Failed to fetch series details (Status ${response.status}: ${response.statusText})`
        );
    }

    return response.json();
}


    
import { apiFetch } from './http';

export type MediaType = 'movie' | 'tv';

export interface MediaSummary {
    id: number;
    mediaType: MediaType;
    title: string;
    overview: string | null;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string | null;
    /** TMDB score out of 10. */
    voteAverage: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Season {
    seasonNumber: number;
    name: string;
    episodeCount: number;
    airDate: string | null;
    posterPath: string | null;
}

export interface MovieDetails {
    id: number;
    title: string;
    overview: string | null;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string | null;
    runtime: number | null;
    voteAverage: number;
    genres: Genre[];
}

export interface SeriesDetails {
    id: number;
    name: string;
    overview: string | null;
    posterPath: string | null;
    backdropPath: string | null;
    firstAirDate: string | null;
    numberOfSeasons: number;
    numberOfEpisodes: number;
    episodeRunTime: number[];
    voteAverage: number;
    genres: Genre[];
    /** Regular seasons only, each with its real episode count. */
    seasons: Season[];
}

export const fetchTrending = (mediaType: MediaType) => apiFetch<MediaSummary[]>(`/api/media/trending/${mediaType}`);

export const searchMedia = (query: string, page = 1) =>
    apiFetch<MediaSummary[]>(`/api/media/search?query=${encodeURIComponent(query.trim())}&page=${page}`);

export const fetchMovieDetails = (id: number) => apiFetch<MovieDetails>(`/api/media/movie/${id}`);

export const fetchSeriesDetails = (id: number) => apiFetch<SeriesDetails>(`/api/media/tv/${id}`);

type PosterSize = 'w92' | 'w185' | 'w342' | 'w500' | 'original';

export const tmdbImage = (path: string | null | undefined, size: PosterSize = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const mediaPath = (mediaType: MediaType, id: number) => `/${mediaType}/${id}`;

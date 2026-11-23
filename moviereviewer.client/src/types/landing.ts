export interface SearchResultItem {
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
    release_date?: string;
    first_air_date?: string;
    poster_path: string | null;
    vote_average: number;
}

export interface FeatureCardItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    placeholderLabel: string;
}

export interface LandingPageProps {
    onOpenAuth: (mode: 'login' | 'signup') => void;
    onSelectMedia?: (id: number, type: 'movie' | 'tv') => void;
}


export interface FeatureCardItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    placeholderLabel: string;
}

export interface LandingPageProps {
    onOpenAuth: (mode: 'login' | 'signup') => void;
}

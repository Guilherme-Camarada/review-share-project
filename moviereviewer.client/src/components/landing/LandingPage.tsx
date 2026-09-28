import React, { useState } from 'react';
import styles from './LandingPage.module.css';
import { ImagePlaceholder } from './ImagePlaceholder';
import type { LandingPageProps, FeatureCardItem } from '../../types/landing';

const FEATURE_CARDS: FeatureCardItem[] = [
    {
        id: 'track',
        title: 'Track Everything',
        description: 'Discovered Movie and rated TV watchlists for tracking movies and TV series.',
        tag: 'Watchlist Management',
        placeholderLabel: 'Watchlist & Progress Mockup',
    },
    {
        id: 'review',
        title: 'Rate & Review',
        description: 'Highlight your view bar, star ratings, and community spoiler-tagged reviews.',
        tag: 'Scores & Community',
        placeholderLabel: 'Ratings & Reviews UI Preview',
    },
    {
        id: 'friends',
        title: 'Connect with Friends',
        description: 'Connect activity with friends, review feeds, and shared watchlists.',
        tag: 'Social Interaction',
        placeholderLabel: 'Friends Activity Feed Preview',
    },
    {
        id: 'details',
        title: 'Full Page Details',
        description: 'Inspect backdrops, runtime, overview, cast, and detailed season information.',
        tag: 'TMDB Deep Data',
        placeholderLabel: 'Media Backdrop & Cast Preview',
    },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onOpenAuth('signup');
        }
    };

    return (
        <div className={styles.landingWrapper}>
            {/* 1. Hero Area */}
            <header className={styles.heroSection}>
                <div className={styles.heroGrid}>
                    <div className={styles.heroTextContent}>
                        <h1 className={styles.heroHeadline}>
                            PostCredits: Your Media Journey, Tracked.
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Log, rate, and discover with friends. Powered by TMDB.
                        </p>
                        <button
                            type="button"
                            className={styles.ctaButtonPrimary}
                            onClick={() => onOpenAuth('signup')}
                        >
                            JOIN THE COMMUNITY
                        </button>
                    </div>

                    <div className={styles.heroMedia}>
                        <ImagePlaceholder
                            label="Hero Community Illustration"
                            subLabel="Replace with friends on sofa watching media graphic"
                            aspectRatio="4 / 3"
                        />
                    </div>
                </div>
            </header>

            {/* 2. 2x2 Feature Showcase Grid */}
            <section className={styles.featuresContainer}>
                <div className={styles.featuresGrid}>
                    {FEATURE_CARDS.map((card) => (
                        <article key={card.id} className={styles.featureCard}>
                            <div className={styles.featureHeader}>
                                <h2 className={styles.featureTitle}>{card.title}</h2>
                                <p className={styles.featureDescription}>{card.description}</p>
                            </div>
                            <ImagePlaceholder
                                label={card.placeholderLabel}
                                subLabel={`Asset target: /screenshots/${card.id}-preview.png`}
                                aspectRatio="16 / 10"
                            />
                        </article>
                    ))}
                </div>
            </section>

            {/* 3. Secondary CTA Section */}
            <section className={styles.bottomCtaSection}>
                <div className={styles.ctaInner}>
                    <h2 className={styles.bottomCtaTitle}>
                        Ready to get logging? Create your free account
                    </h2>
                    <button
                        type="button"
                        className={styles.ctaButtonSecondary}
                        onClick={() => onOpenAuth('signup')}
                    >
                        GET STARTED
                    </button>
                </div>
            </section>
        </div>
    );
};
import React, { useState } from 'react';
import styles from './Dashboard.module.css';

export type WatchlistStatus = 'Watching' | 'Plan to Watch' | 'Finished' | 'Dropped';
export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
    id: string;
    mediaId: number;
    title: string;
    posterPath: string;
    mediaType: MediaType;
    status: WatchlistStatus;
    season?: number;
    episode?: number;
}

export interface RecentLogItem {
    id: string;
    mediaId: number;
    title: string;
    posterPath: string;
    rating: number;
    reviewSnippet: string;
}

export interface FriendActivityItem {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    rating: number;
    mediaTitle: string;
    reviewSnippet: string;
    timestamp: string;
}

export interface TrendingSuggestion {
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    mediaType: MediaType;
    overview: string;
}

interface DashboardProps {
    user: {
        nickname: string;
        userEmail: string;
        avatarUrl?: string;
    };
    onLogout?: () => void;
    onOpenRateLogModal?: () => void;
}

const INITIAL_WATCHLIST: WatchlistItem[] = [
    {
        id: 'w-1',
        mediaId: 106379,
        title: 'Fallout',
        posterPath: 'https://image.tmdb.org/t/p/w342/AnsSKrq99KG0Zuqx9Fg8IlWYUm4.jpg',
        mediaType: 'tv',
        status: 'Watching',
        season: 1,
        episode: 3,
    },
    {
        id: 'w-2',
        mediaId: 126308,
        title: 'Shōgun',
        posterPath: 'https://image.tmdb.org/t/p/w342/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
        mediaType: 'tv',
        status: 'Watching',
        season: 1,
        episode: 3,
    },
    {
        id: 'w-3',
        mediaId: 987654,
        title: 'Last Night',
        posterPath: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        mediaType: 'movie',
        status: 'Plan to Watch',
    },
];

const INITIAL_LOGS: RecentLogItem[] = [
    {
        id: 'l-1',
        mediaId: 106379,
        title: 'Fallout',
        posterPath: 'https://image.tmdb.org/t/p/w185/AnsSKrq99KG0Zuqx9Fg8IlWYUm4.jpg',
        rating: 0.5,
        reviewSnippet: 'Sample text reviews with storopister adipiscing ellt, sed and iluind-blowing visuals!',
    },
    {
        id: 'l-2',
        mediaId: 126308,
        title: 'Shōgun',
        posterPath: 'https://image.tmdb.org/t/p/w185/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
        rating: 1.0,
        reviewSnippet: 'Sample text reviews with storopister adipiscing elit, sed and loiin the noovars rest vilonemleatment.',
    },
    {
        id: 'l-3',
        mediaId: 693134,
        title: 'Dune: Part Two',
        posterPath: 'https://image.tmdb.org/t/p/w185/1pdfLvk8qq9ZnjB1R752C2rEOMP.jpg',
        rating: 4.5,
        reviewSnippet: 'Sample text reviews with storopister adipiscing elit, and reviewd a score.',
    },
];

const INITIAL_FRIENDS_FEED: FriendActivityItem[] = [
    {
        id: 'f-1',
        userId: 'u-2',
        username: 'Alice',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
        rating: 4.5,
        mediaTitle: 'Dune: Part Two',
        reviewSnippet: 'Mind-blowing visuals!',
        timestamp: '15m ago',
    },
    {
        id: 'f-2',
        userId: 'u-3',
        username: 'David',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
        rating: 4.5,
        mediaTitle: 'Dune: Part Two',
        reviewSnippet: 'Mind-blowing visuals!',
        timestamp: '2h ago',
    },
    {
        id: 'f-3',
        userId: 'u-4',
        username: 'Alnna',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
        rating: 4.5,
        mediaTitle: 'Dune: Part Two',
        reviewSnippet: 'Wind-blowing visuals! Berrientafeed',
        timestamp: '2h ago',
    },
];

const INITIAL_SUGGESTIONS: TrendingSuggestion[] = [
    {
        id: 111,
        title: 'The Backstop',
        posterPath: 'https://image.tmdb.org/t/p/w342/vZloFAK7NKnMGKEQJVEZahCcPqm.jpg',
        rating: 4.0,
        mediaType: 'movie',
        overview: 'Mind-blowing visuals!',
    },
    {
        id: 222,
        title: 'Last Night',
        posterPath: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        rating: 4.2,
        mediaType: 'tv',
        overview: 'TMDB trending content with vatchlist.',
    },
];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [watchlistType, setWatchlistType] = useState<MediaType>('tv');
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);

    const handleIncrementEpisode = (itemId: string) => {
        setWatchlist((prev) =>
            prev.map((item) => {
                if (item.id === itemId && item.episode !== undefined) {
                    return { ...item, episode: item.episode + 1 };
                }
                return item;
            })
        );
    };

    const filteredWatchlist = watchlist.filter((item) =>
        watchlistType === 'tv' ? item.mediaType === 'tv' : item.mediaType === 'movie'
    );

    return (
        <div className={styles.pageLayout}>
            <main className={styles.dashboardContainer}>
                {/* Left Column */}
                <div className={styles.column}>
                    {/* Welcome Card */}
                    <section className={styles.sectionCard}>
                        <h1 className={styles.welcomeTitle}>Welcome back, {user.nickname}!</h1>
                        <p className={styles.welcomeSubtitle}>Your media journey continues.</p>
                    </section>

                    {/* My Watchlists Card */}
                    <section className={styles.sectionCard}>
                        <div className={styles.cardHeaderRow}>
                            <h2 className={styles.sectionTitle}>My Watchlists</h2>
                            <div className={styles.filterPillsGroup}>
                                <button
                                    type="button"
                                    className={`${styles.filterPill} ${watchlistType === 'tv' ? styles.filterPillActive : ''}`}
                                    onClick={() => setWatchlistType('tv')}
                                >
                                    TV Series
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.filterPill} ${watchlistType === 'movie' ? styles.filterPillActive : ''}`}
                                    onClick={() => setWatchlistType('movie')}
                                >
                                    Movies
                                </button>
                            </div>
                        </div>

                        <div className={styles.watchlistRow}>
                            {filteredWatchlist.map((item) => (
                                <div key={item.id} className={styles.watchItemCard}>
                                    <img
                                        src={item.posterPath}
                                        alt={item.title}
                                        className={styles.watchItemPoster}
                                    />
                                    <div className={styles.watchItemContent}>
                                        <div>
                                            <div className={styles.watchItemTop}>
                                                <h3 className={styles.watchItemTitle}>{item.title}</h3>
                                                <span style={{ color: '#94a3b8', cursor: 'pointer' }}>•••</span>
                                            </div>
                                            <p className={styles.watchItemSubtitle}>Watchlist</p>
                                            <span className={styles.statusPill}>{item.status}</span>
                                        </div>

                                        {item.mediaType === 'tv' && (
                                            <div className={styles.progressControls}>
                                                <span className={styles.episodeBadge}>
                                                    S{String(item.season || 1).padStart(2, '0')}E{String(item.episode || 1).padStart(2, '0')}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={styles.incrementBtn}
                                                    onClick={() => handleIncrementEpisode(item.id)}
                                                    title="Watched next episode"
                                                >
                                                    +1
                                                </button>
                                                <button type="button" className={styles.editBtn}>
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Logs & Ratings Card */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>
                            Recent Logs & Ratings
                        </h2>
                        <div className={styles.logsList}>
                            {INITIAL_LOGS.map((log) => (
                                <div key={log.id} className={styles.logRow}>
                                    <div className={styles.logLeftInfo}>
                                        <img
                                            src={log.posterPath}
                                            alt={log.title}
                                            className={styles.logPoster}
                                        />
                                        <div className={styles.logDetails}>
                                            <h4 className={styles.logMediaTitle}>{log.title}</h4>
                                            <div className={styles.starRatingRow}>
                                                <span>★</span>
                                                <span className={styles.starScore}>{log.rating.toFixed(1)}</span>
                                            </div>
                                            <p className={styles.logSnippet}>{log.reviewSnippet}</p>
                                        </div>
                                    </div>
                                    <button type="button" className={styles.darkEditButton}>
                                        Edit Log
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className={styles.column}>
                    {/* Friends Activity Feed Card */}
                    <section className={styles.sectionCard}>
                        <div className={styles.cardHeaderRow}>
                            <h2 className={styles.sectionTitle}>Friends Activity Feed</h2>
                            <button type="button" className={styles.outlineButton}>
                                Add Friends
                            </button>
                        </div>

                        <div className={styles.friendsFeedList}>
                            {INITIAL_FRIENDS_FEED.map((activity) => (
                                <div key={activity.id} className={styles.friendActivityRow}>
                                    <img
                                        src={activity.avatarUrl}
                                        alt={activity.username}
                                        className={styles.friendAvatar}
                                    />
                                    <div className={styles.activityBody}>
                                        <div className={styles.activityUserHeader}>
                                            <div className={styles.activityUserHeaderLeft}>
                                                <span>{activity.username}</span>
                                                <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>★ {activity.rating}/5</span>
                                            </div>
                                            <span className={styles.timeAgo}>{activity.timestamp}</span>
                                        </div>
                                        <span className={styles.activityMediaTitle}>
                                            ●●● {activity.mediaTitle}
                                        </span>
                                        <p className={styles.activityComment}>{activity.reviewSnippet}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Suggestions & Trending Card */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: '0.35rem' }}>
                            Suggestions & Trending
                        </h2>
                        <p className={styles.suggestionsSubtitle}>
                            TMDB trending content with vatchlist.
                        </p>

                        <div className={styles.suggestionsGrid}>
                            {INITIAL_SUGGESTIONS.map((item) => (
                                <div key={item.id} className={styles.suggestionCard}>
                                    <img
                                        src={item.posterPath}
                                        alt={item.title}
                                        className={styles.suggestionPoster}
                                    />
                                    <button type="button" className={styles.addToWatchlistButton}>
                                        Add to Watchlist
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};
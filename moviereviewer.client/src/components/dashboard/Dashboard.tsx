import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { fetchLibrary, saveEntry, watchNextEpisode, type LibraryEntry } from '../../api/libraryApi';
import { fetchTrending, type MediaSummary } from '../../api/mediaApi';
import { useLoad } from '../../utils/useLoad';
import { WatchlistSection } from './WatchlistSection';
import { RecentLogsSection } from './RecentLogsSection';
import { FriendsFeedSection } from './FriendsFeedSection';
import { TrendingSection } from './TrendingSection';

export function Dashboard({ nickname }: { nickname: string }) {
    const library = useLoad(() => fetchLibrary(), []);
    const trending = useLoad(async () => {
        const [movies, series] = await Promise.all([fetchTrending('movie'), fetchTrending('tv')]);
        return interleave(movies, series);
    }, []);
    const [actionError, setActionError] = useState<string | null>(null);

    const entries = library.data ?? [];

    const upsertEntry = (updated: LibraryEntry) =>
        library.setData((prev) => [
            updated,
            ...(prev ?? []).filter((e) => !(e.mediaType === updated.mediaType && e.tmdbId === updated.tmdbId)),
        ]);

    const run = async (action: () => Promise<LibraryEntry | null>) => {
        setActionError(null);
        try {
            const updated = await action();
            if (updated) upsertEntry(updated);
        } catch (err) {
            setActionError((err as Error).message);
        }
    };

    const handleNextEpisode = (tmdbId: number) => run(() => watchNextEpisode(tmdbId));

    const handleAddToWatchlist = (item: MediaSummary) =>
        run(() => saveEntry(item.mediaType, item.id, { status: 'planToWatch', rating: null, review: null }));

    return (
        <div className={styles.pageLayout}>
            <main className={styles.dashboardContainer}>
                <div className={styles.column}>
                    <section className={`${styles.sectionCard} ${styles.welcomeCard}`}>
                        <div>
                            <h1 className={styles.welcomeTitle}>Welcome back, {nickname}!</h1>
                            <p className={styles.welcomeSubtitle}>Your media journey continues.</p>
                        </div>
                        <Link to="/list" className={styles.outlineButton}>
                            View my list
                        </Link>
                    </section>

                    {actionError && <p className={styles.errorText}>{actionError}</p>}

                    <WatchlistSection
                        entries={entries}
                        loading={library.loading}
                        error={library.error}
                        onNextEpisode={handleNextEpisode}
                    />
                    <RecentLogsSection entries={entries} loading={library.loading} />
                </div>

                <div className={styles.column}>
                    <FriendsFeedSection />
                    <TrendingSection
                        items={trending.data ?? []}
                        loading={trending.loading}
                        error={trending.error}
                        libraryEntries={entries}
                        onAddToWatchlist={handleAddToWatchlist}
                    />
                </div>
            </main>
        </div>
    );
}

function interleave<T>(a: T[], b: T[]): T[] {
    const result: T[] = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (i < a.length) result.push(a[i]);
        if (i < b.length) result.push(b[i]);
    }
    return result;
}

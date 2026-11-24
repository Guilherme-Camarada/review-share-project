import { useState } from 'react';
import styles from './MediaDetails.module.css';
import type { Season } from '../../api/mediaApi';

interface EpisodeTrackerProps {
    seasons: Season[];
    /** Season number → episodes watched. */
    watched: Record<number, number>;
    onChange: (seasonNumber: number, episodesWatched: number) => void;
    disabled?: boolean;
}

/** Season tabs plus an episode grid. Clicking episode N marks 1..N as watched; clicking the last watched one un-marks it. */
export function EpisodeTracker({ seasons, watched, onChange, disabled }: EpisodeTrackerProps) {
    const [selected, setSelected] = useState(() => firstUnfinished(seasons, watched));
    const season = seasons.find((s) => s.seasonNumber === selected) ?? seasons[0];
    if (!season) return null;

    const watchedCount = watched[season.seasonNumber] ?? 0;

    return (
        <div className={styles.seriesEpisodeCard}>
            <div className={styles.seasonTabs}>
                {seasons.map((s) => (
                    <button
                        key={s.seasonNumber}
                        type="button"
                        className={`${styles.seasonTab} ${s.seasonNumber === season.seasonNumber ? styles.seasonTabActive : ''}`}
                        onClick={() => setSelected(s.seasonNumber)}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            <div className={styles.episodeGridWrapper}>
                <div className={styles.episodeGridHeader}>
                    <span>Episodes</span>
                    <span className={styles.watchedProgressText}>
                        {watchedCount} / {season.episodeCount} watched
                    </span>
                </div>

                {season.episodeCount === 0 ? (
                    <p className={styles.episodeEmpty}>No episodes announced yet.</p>
                ) : (
                    <div className={styles.episodeGrid}>
                        {Array.from({ length: season.episodeCount }, (_, i) => {
                            const episode = i + 1;
                            const isWatched = watchedCount >= episode;
                            return (
                                <button
                                    key={episode}
                                    type="button"
                                    disabled={disabled}
                                    className={`${styles.episodeBox} ${isWatched ? styles.episodeBoxWatched : ''}`}
                                    onClick={() => onChange(season.seasonNumber, watchedCount === episode ? episode - 1 : episode)}
                                    title={`Episode ${episode}${isWatched ? ' (watched)' : ''}`}
                                >
                                    {episode}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function firstUnfinished(seasons: Season[], watched: Record<number, number>) {
    const season = seasons.find((s) => (watched[s.seasonNumber] ?? 0) < s.episodeCount) ?? seasons[0];
    return season?.seasonNumber ?? 1;
}

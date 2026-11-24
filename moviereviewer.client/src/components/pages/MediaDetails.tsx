import { useState } from 'react';
import styles from './MediaDetails.module.css';
import {
    fetchMovieDetails,
    fetchSeriesDetails,
    tmdbImage,
    type MediaType,
    type MovieDetails,
    type SeriesDetails,
} from '../../api/mediaApi';
import {
    fetchEntry,
    saveEntry,
    setSeasonProgress,
    WATCH_STATUSES,
    type LibraryEntry,
    type WatchStatus,
} from '../../api/libraryApi';
import { fetchFriendReviews } from '../../api/friendsApi';
import { useLoad } from '../../utils/useLoad';
import { timeAgo } from '../../utils/time';
import { StarRating } from '../common/StarRating';
import { Avatar } from '../common/Avatar';
import { EpisodeTracker } from './EpisodeTracker';

interface MediaDetailsProps {
    id: number;
    mediaType: MediaType;
    onBack: () => void;
}

type Details = { kind: 'movie'; data: MovieDetails } | { kind: 'tv'; data: SeriesDetails };

const STATUS_STYLES: Record<WatchStatus, { pill: string; active: string }> = {
    planToWatch: { pill: styles.pillPlan, active: styles.pillPlanActive },
    watching: { pill: styles.pillWatching, active: styles.pillWatchingActive },
    finished: { pill: styles.pillFinished, active: styles.pillFinishedActive },
    dropped: { pill: styles.pillDropped, active: styles.pillDroppedActive },
};

export function MediaDetails({ id, mediaType, onBack }: MediaDetailsProps) {
    const details = useLoad<Details>(async () =>
        mediaType === 'movie'
            ? { kind: 'movie', data: await fetchMovieDetails(id) }
            : { kind: 'tv', data: await fetchSeriesDetails(id) },
    [id, mediaType]);
    const entry = useLoad(() => fetchEntry(mediaType, id), [id, mediaType]);
    const friendReviews = useLoad(() => fetchFriendReviews(mediaType, id), [id, mediaType]);

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

    if (details.loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading details...</p>
            </div>
        );
    }

    if (details.error || !details.data) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{details.error || 'Content not found.'}</p>
                <button className={styles.backBtn} onClick={onBack}>Go back</button>
            </div>
        );
    }

    const saved = entry.data;

    const persist = async (request: () => Promise<LibraryEntry | null>, successText?: string) => {
        setSaving(true);
        setSaveMessage(null);
        try {
            entry.setData(await request());
            if (successText) setSaveMessage({ text: successText, isError: false });
        } catch (err) {
            setSaveMessage({ text: (err as Error).message, isError: true });
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = (status: WatchStatus) =>
        persist(() => saveEntry(mediaType, id, {
            status: saved?.status === status ? null : status,
            rating: saved?.rating ?? null,
            review: saved?.review ?? null,
        }));

    const handleLogReview = (rating: number | null, review: string | null) =>
        persist(() => saveEntry(mediaType, id, {
            status: saved?.status ?? (mediaType === 'movie' ? 'finished' : 'watching'),
            rating,
            review,
        }), 'Saved!');

    const handleEpisodes = (seasonNumber: number, episodesWatched: number) =>
        persist(() => setSeasonProgress(id, seasonNumber, episodesWatched));

    const { kind, data } = details.data;
    const title = kind === 'movie' ? data.title : data.name;
    const year = (kind === 'movie' ? data.releaseDate : data.firstAirDate)?.substring(0, 4);
    const posterUrl = tmdbImage(data.posterPath, 'w500');
    const backdropUrl = tmdbImage(data.backdropPath, 'original');
    // Keyed on the saved values so the form starts over from them after loading or saving.
    const reviewCard = (
        <ReviewCard
            key={`${entry.loading}|${saved?.rating}|${saved?.review}`}
            compact={kind === 'movie'}
            savedRating={saved?.rating ?? null}
            savedReview={saved?.review ?? ''}
            disabled={saving || entry.loading}
            saving={saving}
            message={saveMessage}
            onSave={handleLogReview}
        />
    );

    return (
        <main className={styles.pageWrapper}>
            <div className={styles.container}>
                <section
                    className={styles.heroBanner}
                    style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}
                >
                    <div className={styles.heroOverlay}>
                        <div className={styles.heroContent}>
                            <div className={styles.posterContainer}>
                                {posterUrl ? (
                                    <img src={posterUrl} alt={title} className={styles.posterImage} />
                                ) : (
                                    <div className={styles.posterPlaceholder}>🎬</div>
                                )}
                            </div>

                            <div className={styles.heroMain}>
                                <div className={styles.titleArea}>
                                    <h1 className={styles.mediaTitle}>
                                        {title} {year && <span className={styles.year}>({year})</span>}
                                    </h1>

                                    <div className={styles.metaRow}>
                                        <span className={styles.durationText}>
                                            {kind === 'movie'
                                                ? formatRuntime(data.runtime)
                                                : `${data.seasons.length} ${data.seasons.length === 1 ? 'Season' : 'Seasons'} · ${data.seasons.reduce((sum, s) => sum + s.episodeCount, 0)} Episodes`}
                                        </span>
                                        <span className={styles.ratingBadge}>★ {(data.voteAverage / 2).toFixed(1)}/5</span>
                                    </div>

                                    <div className={styles.genreGroup}>
                                        {data.genres.map((g) => (
                                            <span key={g.id} className={styles.genreBadge}>{g.name}</span>
                                        ))}
                                    </div>

                                    <div className={styles.statusPillsRow}>
                                        {WATCH_STATUSES.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={saving || entry.loading}
                                                aria-pressed={saved?.status === value}
                                                className={`${styles.statusPill} ${STATUS_STYLES[value].pill} ${saved?.status === value ? STATUS_STYLES[value].active : ''}`}
                                                onClick={() => handleStatus(value)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {kind === 'movie' ? (
                                    reviewCard
                                ) : (
                                    <div className={styles.seriesInteractiveContainer}>
                                        {!entry.loading && (
                                            <EpisodeTracker
                                                seasons={data.seasons}
                                                watched={saved?.seasons ?? {}}
                                                onChange={handleEpisodes}
                                                disabled={saving}
                                            />
                                        )}
                                        {reviewCard}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.lowerGrid}>
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>Synopsis</h2>
                        <p className={styles.overviewText}>{data.overview || 'No synopsis available for this title.'}</p>
                    </div>

                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>{kind === 'movie' ? 'Cast & Crew' : 'Cast & Creators'}</h2>
                        <p className={styles.overviewText}>Cast information is coming soon.</p>
                    </div>

                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>Friend Reviews</h2>
                        {friendReviews.loading ? (
                            <p className={styles.overviewText}>Loading…</p>
                        ) : !friendReviews.data?.length ? (
                            <p className={styles.overviewText}>None of your friends have reviewed this yet.</p>
                        ) : (
                            <div className={styles.reviewsList}>
                                {friendReviews.data.map((review) => (
                                    <div key={review.user.id} className={styles.reviewItem}>
                                        <Avatar name={review.user.nickname} />
                                        <div className={styles.reviewBody}>
                                            <div className={styles.reviewHeader}>
                                                <span className={styles.reviewUser}>{review.user.nickname}</span>
                                                {review.rating !== null && (
                                                    <span className={styles.reviewRating}>★ {review.rating}/5</span>
                                                )}
                                                <span className={styles.reviewTime}>{timeAgo(review.reviewedAt)}</span>
                                            </div>
                                            {review.review && <p className={styles.reviewText}>{review.review}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

type SaveMessage = { text: string; isError: boolean };

interface ReviewCardProps {
    compact: boolean;
    savedRating: number | null;
    savedReview: string;
    disabled: boolean;
    saving: boolean;
    message: SaveMessage | null;
    onSave: (rating: number | null, review: string | null) => void;
}

function ReviewCard({ compact, savedRating, savedReview, disabled, saving, message, onSave }: ReviewCardProps) {
    const [rating, setRating] = useState(savedRating);
    const [text, setText] = useState(savedReview);
    const dirty = rating !== savedRating || text.trim() !== savedReview;

    return (
        <div className={compact ? styles.movieReviewerCard : styles.seriesReviewerCard}>
            <div className={styles.reviewHeaderRow}>
                <span className={styles.cardHeaderTitle}>Rating & Review</span>
                <StarRating value={rating} onChange={setRating} size={22} />
            </div>
            <textarea
                className={styles.reviewTextarea}
                placeholder="Write your review or notes..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={compact ? 2 : 3}
                maxLength={5000}
            />
            <button
                type="button"
                className={styles.logReviewBtn}
                onClick={() => onSave(rating, text.trim() || null)}
                disabled={disabled || !dirty}
            >
                {saving ? 'Saving…' : 'Log Review'}
            </button>
            {message && <p className={message.isError ? styles.saveError : styles.saveOk}>{message.text}</p>}
        </div>
    );
}

function formatRuntime(minutes: number | null) {
    if (!minutes) return 'Runtime unknown';
    const mins = minutes % 60;
    return `${Math.floor(minutes / 60)}h ${mins < 10 ? '0' : ''}${mins}m`;
}

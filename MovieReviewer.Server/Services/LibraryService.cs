using Microsoft.EntityFrameworkCore;
using MovieReviewer.Server.Data;
using MovieReviewer.Server.Models;

namespace MovieReviewer.Server.Services
{
    /// <summary>Reads and changes a user's list entries. Methods return null when the title doesn't exist on TMDB.</summary>
    public class LibraryService(MovieReviewerDbContext db, TmdbService tmdb)
    {
        public async Task<List<LibraryEntryDto>> ListAsync(string userId, MediaType? mediaType, WatchStatus? status, bool reviewedOnly)
        {
            var query = Entries(userId);

            if (mediaType is not null) query = query.Where(e => e.MediaType == mediaType);
            if (status is not null) query = query.Where(e => e.Status == status);

            query = reviewedOnly
                ? query.Where(e => e.ReviewedAt != null).OrderByDescending(e => e.ReviewedAt)
                : query.OrderByDescending(e => e.UpdatedAt);

            var entries = await query.ToListAsync();
            return entries.Select(LibraryEntryDto.From).ToList();
        }

        public async Task<LibraryEntryDto?> GetAsync(string userId, MediaType mediaType, int tmdbId)
        {
            var entry = await Entries(userId).FirstOrDefaultAsync(e => e.MediaType == mediaType && e.TmdbId == tmdbId);
            return entry is null ? null : LibraryEntryDto.From(entry);
        }

        /// <summary>Sets status, rating and review. Clearing all of them (with no progress) removes the entry.</summary>
        public async Task<SaveResult> SaveAsync(string userId, MediaType mediaType, int tmdbId, SaveEntryRequest request)
        {
            var entry = await GetOrCreateAsync(userId, mediaType, tmdbId);
            if (entry is null) return SaveResult.NotFound;

            var review = string.IsNullOrWhiteSpace(request.Review) ? null : request.Review.Trim();
            if (entry.Rating != request.Rating || entry.Review != review)
                entry.ReviewedAt = request.Rating is null && review is null ? null : DateTime.UtcNow;

            entry.Status = request.Status;
            entry.Rating = request.Rating;
            entry.Review = review;

            return await CommitAsync(entry);
        }

        public async Task<SaveResult> SetSeasonProgressAsync(string userId, int tmdbId, int seasonNumber, int episodesWatched)
        {
            var series = await tmdb.GetSeriesAsync(tmdbId);
            var season = series?.Seasons.FirstOrDefault(s => s.SeasonNumber == seasonNumber);
            if (series is null || season is null) return SaveResult.NotFound;

            var entry = await GetOrCreateAsync(userId, MediaType.Tv, tmdbId, series);
            if (entry is null) return SaveResult.NotFound;

            SetProgress(entry, seasonNumber, Math.Clamp(episodesWatched, 0, season.EpisodeCount));
            if (episodesWatched > 0) MarkStarted(entry);

            return await CommitAsync(entry);
        }

        /// <summary>Marks the next unwatched episode as watched, moving on to the next season when needed.</summary>
        public async Task<SaveResult> WatchNextEpisodeAsync(string userId, int tmdbId)
        {
            var series = await tmdb.GetSeriesAsync(tmdbId);
            if (series is null || series.Seasons.Count == 0) return SaveResult.NotFound;

            var entry = await GetOrCreateAsync(userId, MediaType.Tv, tmdbId, series);
            if (entry is null) return SaveResult.NotFound;

            var seasons = series.Seasons.OrderBy(s => s.SeasonNumber).ToList();
            var latest = entry.Seasons.Where(s => s.EpisodesWatched > 0).MaxBy(s => s.SeasonNumber);
            var currentIndex = latest is null ? -1 : seasons.FindIndex(s => s.SeasonNumber == latest.SeasonNumber);

            if (latest is not null && currentIndex >= 0 && latest.EpisodesWatched < seasons[currentIndex].EpisodeCount)
            {
                latest.EpisodesWatched++;
            }
            else if (currentIndex + 1 < seasons.Count)
            {
                SetProgress(entry, seasons[currentIndex + 1].SeasonNumber, 1);
            }

            MarkStarted(entry);

            var last = seasons[^1];
            if (entry.Seasons.Any(s => s.SeasonNumber == last.SeasonNumber && s.EpisodesWatched >= last.EpisodeCount))
                entry.Status = WatchStatus.Finished;

            return await CommitAsync(entry);
        }

        public async Task<bool> DeleteAsync(string userId, MediaType mediaType, int tmdbId)
        {
            var deleted = await db.LibraryEntries
                .Where(e => e.UserId == userId && e.MediaType == mediaType && e.TmdbId == tmdbId)
                .ExecuteDeleteAsync();
            return deleted > 0;
        }

        private IQueryable<LibraryEntry> Entries(string userId) =>
            db.LibraryEntries.Include(e => e.Seasons).Where(e => e.UserId == userId);

        private async Task<LibraryEntry?> GetOrCreateAsync(string userId, MediaType mediaType, int tmdbId, SeriesDetails? knownSeries = null)
        {
            var entry = await Entries(userId).FirstOrDefaultAsync(e => e.MediaType == mediaType && e.TmdbId == tmdbId);
            if (entry is not null) return entry;

            entry = new LibraryEntry { UserId = userId, MediaType = mediaType, TmdbId = tmdbId, CreatedAt = DateTime.UtcNow };

            if (mediaType == MediaType.Movie)
            {
                var movie = await tmdb.GetMovieAsync(tmdbId);
                if (movie is null) return null;
                entry.Title = movie.Title;
                entry.PosterPath = movie.PosterPath;
            }
            else
            {
                var series = knownSeries ?? await tmdb.GetSeriesAsync(tmdbId);
                if (series is null) return null;
                entry.Title = series.Name;
                entry.PosterPath = series.PosterPath;
                entry.TotalEpisodes = series.Seasons.Sum(s => s.EpisodeCount);
            }

            db.LibraryEntries.Add(entry);
            return entry;
        }

        private static void SetProgress(LibraryEntry entry, int seasonNumber, int episodesWatched)
        {
            var progress = entry.Seasons.FirstOrDefault(s => s.SeasonNumber == seasonNumber);
            if (progress is null)
                entry.Seasons.Add(new SeasonProgress { SeasonNumber = seasonNumber, EpisodesWatched = episodesWatched });
            else
                progress.EpisodesWatched = episodesWatched;
        }

        private static void MarkStarted(LibraryEntry entry)
        {
            if (entry.Status is null or WatchStatus.PlanToWatch)
                entry.Status = WatchStatus.Watching;
        }

        private async Task<SaveResult> CommitAsync(LibraryEntry entry)
        {
            if (entry.IsEmpty)
            {
                if (db.Entry(entry).State != EntityState.Added) db.LibraryEntries.Remove(entry);
                else db.Entry(entry).State = EntityState.Detached;
                await db.SaveChangesAsync();
                return SaveResult.Removed;
            }

            entry.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return SaveResult.Saved(LibraryEntryDto.From(entry));
        }
    }

    public record SaveResult(LibraryEntryDto? Entry, bool Found)
    {
        public static readonly SaveResult NotFound = new(null, false);
        public static readonly SaveResult Removed = new(null, true);
        public static SaveResult Saved(LibraryEntryDto entry) => new(entry, true);
    }
}

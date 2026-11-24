using System.ComponentModel.DataAnnotations;

namespace MovieReviewer.Server.Models
{
    // ---- Library ----

    public record EpisodeRef(int Season, int Episode);

    public record LibraryEntryDto(
        int TmdbId,
        MediaType MediaType,
        string Title,
        string? PosterPath,
        WatchStatus? Status,
        double? Rating,
        string? Review,
        int EpisodesWatched,
        int? TotalEpisodes,
        EpisodeRef? LastWatched,
        Dictionary<int, int> Seasons,
        DateTime UpdatedAt,
        DateTime? ReviewedAt)
    {
        public static LibraryEntryDto From(LibraryEntry e)
        {
            var latest = e.Seasons.Where(s => s.EpisodesWatched > 0).MaxBy(s => s.SeasonNumber);

            return new LibraryEntryDto(
                e.TmdbId, e.MediaType, e.Title, e.PosterPath, e.Status, e.Rating, e.Review,
                e.Seasons.Sum(s => s.EpisodesWatched),
                e.TotalEpisodes,
                latest is null ? null : new EpisodeRef(latest.SeasonNumber, latest.EpisodesWatched),
                e.Seasons.ToDictionary(s => s.SeasonNumber, s => s.EpisodesWatched),
                e.UpdatedAt,
                e.ReviewedAt);
        }
    }

    public record SaveEntryRequest(
        WatchStatus? Status,
        [Range(0.5, 5)] double? Rating,
        [MaxLength(5000)] string? Review);

    public record SeasonProgressRequest([Range(0, 1000)] int EpisodesWatched);

    // ---- Friends ----

    public record UserSummary(string Id, string Nickname);

    public enum Relationship
    {
        None,
        Friends,
        RequestSent,
        RequestReceived
    }

    public record UserSearchResult(string Id, string Nickname, Relationship Relationship, int? RequestId);

    public record FriendRequestDto(int Id, UserSummary From, DateTime CreatedAt);

    public record SendFriendRequest([Required] string UserId);

    /// <summary>A friend's rating or review, used by the activity feed and the title page.</summary>
    public record FriendReviewDto(
        UserSummary User,
        int TmdbId,
        MediaType MediaType,
        string Title,
        string? PosterPath,
        WatchStatus? Status,
        double? Rating,
        string? Review,
        DateTime ReviewedAt);
}

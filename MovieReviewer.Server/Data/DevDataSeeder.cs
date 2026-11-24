using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MovieReviewer.Server.Models;
using MovieReviewer.Server.Services;

namespace MovieReviewer.Server.Data
{
    /// <summary>
    /// Development-only: creates mock friends with reviews so the dashboard and friends feed have content.
    /// Every real user gets the mock users as friends (plus one pending request) the first time the app
    /// starts after they register. Mock users have no password, so nobody can sign in as them.
    /// </summary>
    public static class DevDataSeeder
    {
        private const string MockEmailDomain = "mock.postcredits.test";
        private const string DemoEmail = "demo@postcredits.test";

        private record MockReview(int TmdbId, MediaType Type, double Rating, string Review, WatchStatus Status, int HoursAgo);

        private record MockUser(string Nickname, bool SendsRequest, MockReview[] Reviews);

        private static readonly MockUser[] MockUsers =
        [
            new("Alice", false,
            [
                new(693134, MediaType.Movie, 4.5, "Mind-blowing visuals! Villeneuve outdid himself.", WatchStatus.Finished, 1),
                new(126308, MediaType.Tv, 5, "Best drama in years. Every episode feels like a film.", WatchStatus.Finished, 26),
                new(666277, MediaType.Movie, 4, "Quiet and devastating. Stayed with me for days.", WatchStatus.Finished, 72),
            ]),
            new("Marco", false,
            [
                new(106379, MediaType.Tv, 4, "Way funnier than I expected. The Ghoul steals every scene.", WatchStatus.Watching, 3),
                new(872585, MediaType.Movie, 4.5, "That Trinity sequence is something else.", WatchStatus.Finished, 50),
                new(94605, MediaType.Tv, 5, "The animation is unreal.", WatchStatus.Finished, 120),
            ]),
            new("Priya", false,
            [
                new(136315, MediaType.Tv, 3.5, "Stressful in the best way.", WatchStatus.Watching, 5),
                new(95396, MediaType.Tv, 4.5, "The finale had me yelling at the screen.", WatchStatus.Finished, 8),
                new(693134, MediaType.Movie, 4, "Loved the score. Second half drags a little.", WatchStatus.Finished, 30),
            ]),
            new("Sam", true,
            [
                new(872585, MediaType.Movie, 3, "Great performances, but too long.", WatchStatus.Finished, 10),
                new(106379, MediaType.Tv, 4.5, "Perfect adaptation.", WatchStatus.Finished, 20),
            ]),
        ];

        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MovieReviewerDbContext>();
            var users = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var tmdb = scope.ServiceProvider.GetRequiredService<TmdbService>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DevDataSeeder));

            await db.Database.MigrateAsync();

            await EnsureDemoUserAsync(users, config["DevSeed:DemoPassword"], logger);

            var mocks = new List<(User User, MockUser Definition)>();
            foreach (var definition in MockUsers)
                mocks.Add((await EnsureMockUserAsync(db, users, tmdb, definition, logger), definition));

            await BefriendRealUsersAsync(db, mocks);
        }

        // Optional account with a known password for trying the app locally. Only created when
        // DevSeed:DemoPassword is set (appsettings.Development.json, which is not committed).
        private static async Task EnsureDemoUserAsync(UserManager<User> users, string? password, ILogger logger)
        {
            if (string.IsNullOrEmpty(password) || await users.FindByEmailAsync(DemoEmail) is not null)
                return;

            var demo = new User
            {
                UserName = DemoEmail,
                Email = DemoEmail,
                Nickname = "Demo",
                EmailConfirmed = true,
                RegistrationDate = DateTime.UtcNow
            };
            var result = await users.CreateAsync(demo, password);
            if (!result.Succeeded)
                logger.LogWarning("Could not create demo user: {Errors}", string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        private static async Task<User> EnsureMockUserAsync(
            MovieReviewerDbContext db, UserManager<User> users, TmdbService tmdb, MockUser definition, ILogger logger)
        {
            var email = $"{definition.Nickname.ToLowerInvariant()}@{MockEmailDomain}";
            var user = await users.FindByEmailAsync(email);
            if (user is not null) return user;

            user = new User
            {
                UserName = email,
                Email = email,
                Nickname = definition.Nickname,
                EmailConfirmed = true,
                IsMock = true,
                RegistrationDate = DateTime.UtcNow
            };

            // Fetch from TMDB before creating the user, so a TMDB outage doesn't leave a mock user without reviews.
            var entries = new List<LibraryEntry>();
            foreach (var review in definition.Reviews)
            {
                var entry = await BuildEntryAsync(tmdb, user.Id, review);
                if (entry is null)
                    logger.LogWarning("Skipping mock review: TMDB has no {Type} {Id}", review.Type, review.TmdbId);
                else
                    entries.Add(entry);
            }

            await users.CreateAsync(user);
            db.LibraryEntries.AddRange(entries);
            await db.SaveChangesAsync();
            return user;
        }

        private static async Task<LibraryEntry?> BuildEntryAsync(TmdbService tmdb, string userId, MockReview review)
        {
            var reviewedAt = DateTime.UtcNow.AddHours(-review.HoursAgo);
            var entry = new LibraryEntry
            {
                UserId = userId,
                TmdbId = review.TmdbId,
                MediaType = review.Type,
                Status = review.Status,
                Rating = review.Rating,
                Review = review.Review,
                CreatedAt = reviewedAt,
                UpdatedAt = reviewedAt,
                ReviewedAt = reviewedAt
            };

            if (review.Type == MediaType.Movie)
            {
                if (await tmdb.GetMovieAsync(review.TmdbId) is not { } movie) return null;
                entry.Title = movie.Title;
                entry.PosterPath = movie.PosterPath;
            }
            else
            {
                if (await tmdb.GetSeriesAsync(review.TmdbId) is not { } series || series.Seasons.Count == 0) return null;
                entry.Title = series.Name;
                entry.PosterPath = series.PosterPath;
                entry.TotalEpisodes = series.Seasons.Sum(s => s.EpisodeCount);

                // Finished: everything watched. Watching: partway through the first season.
                entry.Seasons = review.Status == WatchStatus.Finished
                    ? series.Seasons.Select(s => new SeasonProgress { SeasonNumber = s.SeasonNumber, EpisodesWatched = s.EpisodeCount }).ToList()
                    : [new SeasonProgress { SeasonNumber = series.Seasons[0].SeasonNumber, EpisodesWatched = Math.Max(1, series.Seasons[0].EpisodeCount / 2) }];
            }

            return entry;
        }

        private static async Task BefriendRealUsersAsync(MovieReviewerDbContext db, List<(User User, MockUser Definition)> mocks)
        {
            var mockIds = mocks.Select(m => m.User.Id).ToList();

            // Users that have never been linked to a mock user. Once linked, their own accept/decline/remove choices stick.
            var newUsers = await db.Users
                .Where(u => !u.IsMock && u.EmailConfirmed)
                .Where(u => !db.Friendships.Any(f =>
                    (f.RequesterId == u.Id && mockIds.Contains(f.AddresseeId)) ||
                    (f.AddresseeId == u.Id && mockIds.Contains(f.RequesterId))))
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var userId in newUsers)
            {
                foreach (var (mock, definition) in mocks)
                {
                    db.Friendships.Add(new Friendship
                    {
                        RequesterId = mock.Id,
                        AddresseeId = userId,
                        CreatedAt = DateTime.UtcNow,
                        Status = definition.SendsRequest ? FriendshipStatus.Pending : FriendshipStatus.Accepted,
                        AcceptedAt = definition.SendsRequest ? null : DateTime.UtcNow
                    });
                }
            }

            await db.SaveChangesAsync();
        }
    }
}

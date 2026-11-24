using System.Linq.Expressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReviewer.Server.Data;
using MovieReviewer.Server.Models;

namespace MovieReviewer.Server.Controllers
{
    [Route("api/friends")]
    public class FriendsController(MovieReviewerDbContext db) : AuthorizedApiController
    {
        [HttpGet]
        public Task<List<UserSummary>> List()
        {
            var friendIds = FriendIds(CurrentUserId);
            return db.Users
                .Where(u => friendIds.Contains(u.Id))
                .OrderBy(u => u.Nickname)
                .Select(u => new UserSummary(u.Id, u.Nickname))
                .ToListAsync();
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> Remove(string userId)
        {
            var me = CurrentUserId;
            var deleted = await db.Friendships
                .Where(f => f.Status == FriendshipStatus.Accepted
                    && ((f.RequesterId == me && f.AddresseeId == userId) || (f.RequesterId == userId && f.AddresseeId == me)))
                .ExecuteDeleteAsync();
            return deleted > 0 ? NoContent() : NotFound();
        }

        /// <summary>Finds users by nickname and says how each one relates to the current user.</summary>
        [HttpGet("search")]
        public async Task<List<UserSearchResult>> Search([FromQuery] string query)
        {
            var me = CurrentUserId;
            var term = query?.Trim().ToLower() ?? string.Empty;
            if (term.Length < 2) return [];

            var users = await db.Users
                .Where(u => u.Id != me && u.EmailConfirmed && u.Nickname.ToLower().Contains(term))
                .OrderBy(u => u.Nickname)
                .Take(10)
                .Select(u => new UserSummary(u.Id, u.Nickname))
                .ToListAsync();

            var ids = users.Select(u => u.Id).ToList();
            var links = await db.Friendships
                .Where(f => (f.RequesterId == me && ids.Contains(f.AddresseeId)) || (f.AddresseeId == me && ids.Contains(f.RequesterId)))
                .ToListAsync();

            return users.Select(u =>
            {
                var link = links.FirstOrDefault(f => f.RequesterId == u.Id || f.AddresseeId == u.Id);
                var relationship = link switch
                {
                    null => Relationship.None,
                    { Status: FriendshipStatus.Accepted } => Relationship.Friends,
                    _ when link.RequesterId == me => Relationship.RequestSent,
                    _ => Relationship.RequestReceived
                };
                return new UserSearchResult(u.Id, u.Nickname, relationship, link?.Status == FriendshipStatus.Pending ? link.Id : null);
            }).ToList();
        }

        /// <summary>Pending requests other users sent to the current user.</summary>
        [HttpGet("requests")]
        public Task<List<FriendRequestDto>> IncomingRequests() =>
            db.Friendships
                .Where(f => f.AddresseeId == CurrentUserId && f.Status == FriendshipStatus.Pending)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FriendRequestDto(f.Id, new UserSummary(f.RequesterId, f.Requester!.Nickname), f.CreatedAt))
                .ToListAsync();

        [HttpPost("requests")]
        public async Task<IActionResult> SendRequest(SendFriendRequest request)
        {
            var me = CurrentUserId;
            if (request.UserId == me) return BadRequest(new { message = "You can't add yourself." });

            var target = await db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId && u.EmailConfirmed);
            if (target is null) return NotFound(new { message = "User not found." });

            var existing = await db.Friendships.FirstOrDefaultAsync(f =>
                (f.RequesterId == me && f.AddresseeId == target.Id) || (f.RequesterId == target.Id && f.AddresseeId == me));

            if (existing is { Status: FriendshipStatus.Accepted })
                return Conflict(new { message = "You're already friends." });
            if (existing is not null && existing.RequesterId == me)
                return Conflict(new { message = "Friend request already sent." });

            if (existing is not null)
            {
                // They already asked us: sending a request back accepts theirs.
                Accept(existing);
            }
            else
            {
                existing = new Friendship { RequesterId = me, AddresseeId = target.Id, CreatedAt = DateTime.UtcNow };
                db.Friendships.Add(existing);

                // Mock users (dev seed data) have nobody to click "accept", so they accept straight away.
                if (target.IsMock) Accept(existing);
            }

            await db.SaveChangesAsync();
            return Ok(new { status = existing.Status });
        }

        [HttpPost("requests/{id:int}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            var request = await db.Friendships.FirstOrDefaultAsync(f =>
                f.Id == id && f.AddresseeId == CurrentUserId && f.Status == FriendshipStatus.Pending);
            if (request is null) return NotFound();

            Accept(request);
            await db.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Declines an incoming request or cancels an outgoing one.</summary>
        [HttpDelete("requests/{id:int}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var me = CurrentUserId;
            var deleted = await db.Friendships
                .Where(f => f.Id == id && f.Status == FriendshipStatus.Pending && (f.AddresseeId == me || f.RequesterId == me))
                .ExecuteDeleteAsync();
            return deleted > 0 ? NoContent() : NotFound();
        }

        /// <summary>Friends' latest ratings and reviews, newest first.</summary>
        [HttpGet("activity")]
        public Task<List<FriendReviewDto>> Activity([FromQuery] int limit = 10) =>
            FriendEntries(CurrentUserId)
                .OrderByDescending(e => e.ReviewedAt)
                .Take(Math.Clamp(limit, 1, 50))
                .Select(ToFriendReview)
                .ToListAsync();

        /// <summary>What friends thought of one title.</summary>
        [HttpGet("reviews/{mediaType}/{tmdbId:int}")]
        public Task<List<FriendReviewDto>> ReviewsForTitle(MediaType mediaType, int tmdbId) =>
            FriendEntries(CurrentUserId)
                .Where(e => e.MediaType == mediaType && e.TmdbId == tmdbId)
                .OrderByDescending(e => e.ReviewedAt)
                .Select(ToFriendReview)
                .ToListAsync();

        private IQueryable<string> FriendIds(string me) =>
            db.Friendships
                .Where(f => f.Status == FriendshipStatus.Accepted && (f.RequesterId == me || f.AddresseeId == me))
                .Select(f => f.RequesterId == me ? f.AddresseeId : f.RequesterId);

        private IQueryable<LibraryEntry> FriendEntries(string me)
        {
            var friendIds = FriendIds(me);
            return db.LibraryEntries.Where(e => e.ReviewedAt != null && friendIds.Contains(e.UserId));
        }

        private static readonly Expression<Func<LibraryEntry, FriendReviewDto>> ToFriendReview = e =>
            new FriendReviewDto(
                new UserSummary(e.UserId, e.User!.Nickname),
                e.TmdbId, e.MediaType, e.Title, e.PosterPath, e.Status, e.Rating, e.Review, e.ReviewedAt!.Value);

        private static void Accept(Friendship friendship)
        {
            friendship.Status = FriendshipStatus.Accepted;
            friendship.AcceptedAt = DateTime.UtcNow;
        }
    }
}

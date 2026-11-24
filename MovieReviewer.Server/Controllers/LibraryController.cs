using Microsoft.AspNetCore.Mvc;
using MovieReviewer.Server.Models;
using MovieReviewer.Server.Services;

namespace MovieReviewer.Server.Controllers
{
    /// <summary>The signed-in user's list: watch status, ratings, reviews and episode progress.</summary>
    [Route("api/library")]
    public class LibraryController(LibraryService library) : AuthorizedApiController
    {
        [HttpGet]
        public Task<List<LibraryEntryDto>> List(
            [FromQuery] MediaType? mediaType,
            [FromQuery] WatchStatus? status,
            [FromQuery] bool reviewedOnly = false) =>
            library.ListAsync(CurrentUserId, mediaType, status, reviewedOnly);

        /// <summary>Returns 204 No Content when the title isn't in the user's list.</summary>
        [HttpGet("{mediaType}/{tmdbId:int}")]
        public Task<LibraryEntryDto?> Get(MediaType mediaType, int tmdbId) =>
            library.GetAsync(CurrentUserId, mediaType, tmdbId);

        [HttpPut("{mediaType}/{tmdbId:int}")]
        public async Task<IActionResult> Save(MediaType mediaType, int tmdbId, SaveEntryRequest request)
        {
            if (request.Rating is { } rating && rating * 2 != Math.Floor(rating * 2))
                return ValidationProblem("Rating must be in half-star steps.");

            return ToResponse(await library.SaveAsync(CurrentUserId, mediaType, tmdbId, request));
        }

        [HttpDelete("{mediaType}/{tmdbId:int}")]
        public async Task<IActionResult> Delete(MediaType mediaType, int tmdbId) =>
            await library.DeleteAsync(CurrentUserId, mediaType, tmdbId) ? NoContent() : NotFound();

        [HttpPut("tv/{tmdbId:int}/seasons/{seasonNumber:int}")]
        public async Task<IActionResult> SetSeasonProgress(int tmdbId, int seasonNumber, SeasonProgressRequest request) =>
            ToResponse(await library.SetSeasonProgressAsync(CurrentUserId, tmdbId, seasonNumber, request.EpisodesWatched));

        [HttpPost("tv/{tmdbId:int}/next-episode")]
        public async Task<IActionResult> WatchNextEpisode(int tmdbId) =>
            ToResponse(await library.WatchNextEpisodeAsync(CurrentUserId, tmdbId));

        private IActionResult ToResponse(SaveResult result) =>
            !result.Found ? NotFound()
            : result.Entry is null ? NoContent()
            : Ok(result.Entry);
    }
}

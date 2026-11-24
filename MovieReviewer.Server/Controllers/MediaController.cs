using Microsoft.AspNetCore.Mvc;
using MovieReviewer.Server.Models;
using MovieReviewer.Server.Services;

namespace MovieReviewer.Server.Controllers
{
    [ApiController]
    [Route("api/media")]
    public class MediaController(TmdbService tmdb) : ControllerBase
    {
        [HttpGet("trending/{mediaType}")]
        public Task<List<MediaSummary>> GetTrending(MediaType mediaType) => tmdb.GetTrendingAsync(mediaType);

        [HttpGet("search")]
        public async Task<ActionResult<List<MediaSummary>>> Search([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<MediaSummary>();

            return await tmdb.SearchAsync(query.Trim(), Math.Max(1, page));
        }

        [HttpGet("movie/{id:int}")]
        public async Task<ActionResult<MovieDetails>> GetMovie(int id) =>
            await tmdb.GetMovieAsync(id) is { } movie ? movie : NotFound();

        [HttpGet("tv/{id:int}")]
        public async Task<ActionResult<SeriesDetails>> GetSeries(int id) =>
            await tmdb.GetSeriesAsync(id) is { } series ? series : NotFound();
    }
}

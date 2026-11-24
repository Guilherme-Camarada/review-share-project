using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MovieReviewer.Server.Controllers
{
    /// <summary>Base for endpoints that need a signed-in user.</summary>
    [ApiController]
    [Authorize]
    public abstract class AuthorizedApiController : ControllerBase
    {
        protected string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Authenticated user has no id claim.");
    }
}

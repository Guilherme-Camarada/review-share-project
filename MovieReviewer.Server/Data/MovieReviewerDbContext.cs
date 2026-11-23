using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MovieReviewer.Server.Models;

namespace MovieReviewer.Server.Data
{
    public class MovieReviewerDbContext : IdentityDbContext<User>
    {

        public MovieReviewerDbContext(DbContextOptions<MovieReviewerDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            builder.Entity<User>(entity =>
            {
                entity.Property(u => u.Nickname).HasMaxLength(30).IsRequired();
                entity.Property(u => u.RegistrationDate).IsRequired();
                //entity.Property(u => u.IsEmailConfirmed).IsRequired();
            });
        }
    }
}

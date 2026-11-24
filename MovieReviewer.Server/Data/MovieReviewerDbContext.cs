using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MovieReviewer.Server.Models;

namespace MovieReviewer.Server.Data
{
    public class MovieReviewerDbContext(DbContextOptions<MovieReviewerDbContext> options)
        : IdentityDbContext<User>(options)
    {
        public DbSet<LibraryEntry> LibraryEntries => Set<LibraryEntry>();
        public DbSet<SeasonProgress> SeasonProgress => Set<SeasonProgress>();
        public DbSet<Friendship> Friendships => Set<Friendship>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>(entity =>
            {
                entity.Property(u => u.Nickname).HasMaxLength(30).IsRequired();
                entity.Property(u => u.RegistrationDate).IsRequired();
            });

            builder.Entity<LibraryEntry>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.MediaType, e.TmdbId }).IsUnique();
                entity.HasIndex(e => e.ReviewedAt);
                entity.Property(e => e.MediaType).HasConversion<string>().HasMaxLength(10);
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
                entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
                entity.Property(e => e.Review).HasMaxLength(5000);
                entity.Ignore(e => e.IsEmpty);

                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(e => e.Seasons).WithOne().HasForeignKey(s => s.LibraryEntryId).OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<SeasonProgress>().HasKey(s => new { s.LibraryEntryId, s.SeasonNumber });

            builder.Entity<Friendship>(entity =>
            {
                entity.HasIndex(f => new { f.RequesterId, f.AddresseeId }).IsUnique();
                entity.Property(f => f.Status).HasConversion<string>().HasMaxLength(20);

                entity.HasOne(f => f.Requester).WithMany().HasForeignKey(f => f.RequesterId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(f => f.Addressee).WithMany().HasForeignKey(f => f.AddresseeId).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieReviewer.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddLibraryAndFriends : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMock",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Friendships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RequesterId = table.Column<string>(type: "TEXT", nullable: false),
                    AddresseeId = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friendships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Friendships_AspNetUsers_AddresseeId",
                        column: x => x.AddresseeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Friendships_AspNetUsers_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LibraryEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    TmdbId = table.Column<int>(type: "INTEGER", nullable: false),
                    MediaType = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    PosterPath = table.Column<string>(type: "TEXT", nullable: true),
                    TotalEpisodes = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Rating = table.Column<double>(type: "REAL", nullable: true),
                    Review = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LibraryEntries_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SeasonProgress",
                columns: table => new
                {
                    LibraryEntryId = table.Column<int>(type: "INTEGER", nullable: false),
                    SeasonNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    EpisodesWatched = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeasonProgress", x => new { x.LibraryEntryId, x.SeasonNumber });
                    table.ForeignKey(
                        name: "FK_SeasonProgress_LibraryEntries_LibraryEntryId",
                        column: x => x.LibraryEntryId,
                        principalTable: "LibraryEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_AddresseeId",
                table: "Friendships",
                column: "AddresseeId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_RequesterId_AddresseeId",
                table: "Friendships",
                columns: new[] { "RequesterId", "AddresseeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LibraryEntries_ReviewedAt",
                table: "LibraryEntries",
                column: "ReviewedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryEntries_UserId_MediaType_TmdbId",
                table: "LibraryEntries",
                columns: new[] { "UserId", "MediaType", "TmdbId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Friendships");

            migrationBuilder.DropTable(
                name: "SeasonProgress");

            migrationBuilder.DropTable(
                name: "LibraryEntries");

            migrationBuilder.DropColumn(
                name: "IsMock",
                table: "AspNetUsers");
        }
    }
}

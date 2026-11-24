# PostCredits (review-share-project)
An app where you can review movies and series, see what your friends have reviewed and manage a watchlist.

## Running locally

1. Set the TMDB API key and email settings as user secrets on `MovieReviewer.Server` (`TMDB:ApiKey`, `EmailSettings:*`).
2. Apply database migrations. In Development the server also applies them on startup.
   ```powershell
   dotnet tool restore
   dotnet ef database update --project MovieReviewer.Server
   ```
3. Start the solution from Visual Studio (or `dotnet run --project MovieReviewer.Server`).

### Development seed data
In Development, `Data/DevDataSeeder.cs` creates four mock users (Alice, Marco, Priya, Sam) with reviews of real TMDB titles.
Every confirmed account becomes friends with them the first time the server starts after it registers; Sam sends a friend request instead, so you can try accepting one.
Mock users have no password and accept friend requests automatically.

To get a ready-to-use local account, add a password to `MovieReviewer.Server/appsettings.Development.json` (not committed):
```json
{ "DevSeed": { "DemoPassword": "<a password that meets the Identity rules>" } }
```
The server then creates `demo@postcredits.test` with that password, already confirmed.

## Adding a migration
```powershell
dotnet ef migrations add <Name> --project MovieReviewer.Server
```

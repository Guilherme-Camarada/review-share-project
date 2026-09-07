# Stage 1: Build .NET 10 API & React Client
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install Node.js for Vite/React build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy solution and project files
COPY *.sln* ./
COPY MovieReviewer.Server/*.csproj ./MovieReviewer.Server/
COPY moviereviewer.client/*.json ./moviereviewer.client/

# Build client dependencies
WORKDIR /src/moviereviewer.client
RUN npm install
COPY moviereviewer.client/ ./
RUN npm run build

# Publish .NET 10 API
WORKDIR /src/MovieReviewer.Server
COPY MovieReviewer.Server/ ./
RUN mkdir -p wwwroot && cp -r /src/moviereviewer.client/dist/* ./wwwroot/
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal .NET 10 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "MovieReviewer.Server.dll"]
# Trail Explorer Deployment

Deployment targets:

- Database: Supabase PostgreSQL
- Docker Registry: Azure Container Registry, ACR
- Backend: Azure App Service for Linux container
- Frontend: Vercel

Do not commit production secrets, database passwords, JWT secrets, OAuth secrets, or DOC API keys to the repository.

---

## 1. Database

Production uses Supabase PostgreSQL instead of the local SQLite database.

### 1.1 Schema

Production uses this schema:

```text
trail_explorer
```

Create the schema first in Supabase SQL Editor:

```sql
create schema if not exists trail_explorer;
```

### 1.2 EF Core Configuration

`ApplicationDbContext` should use the default schema:

```csharp
modelBuilder.HasDefaultSchema("trail_explorer");
```

The PostgreSQL provider should also store the migration history table in the same schema:

```csharp
options.UseNpgsql(
    builder.Configuration.GetConnectionString("Postgres"),
    npgsqlOptions =>
    {
        npgsqlOptions.MigrationsHistoryTable(
            "__EFMigrationsHistory",
            "trail_explorer");
    });
```

### 1.3 Connection String

Use this Azure App Service app setting:

```text
ConnectionStrings__Postgres=<Supabase PostgreSQL connection string>
```

The Supabase connection string should use SSL:

```text
SSL Mode=Require;Trust Server Certificate=true
```

Do not write the connection string into `appsettings.json` or commit it to Git.

### 1.4 Migration

The production schema and migrations are managed by EF Core. In non-Testing environments, the backend runs this during startup:

```csharp
dbContext.Database.Migrate();
```

This means the Azure backend container automatically checks and applies pending migrations when it starts.

To create a migration locally, run this from the repository root:

```powershell
dotnet ef migrations add <MigrationName> --project backend --startup-project backend --output-dir Migrations
```

To inspect the migration list manually:

```powershell
dotnet ef migrations list --project backend --startup-project backend
```

To manually apply migrations to the currently configured PostgreSQL database:

```powershell
dotnet ef database update --project backend --startup-project backend
```

Alternatively, generate a SQL script and run it manually in Supabase SQL Editor:

```powershell
dotnet ef migrations script --project backend --startup-project backend -o postgres-migration.sql
```

Before deployment, confirm that migrations use the `trail_explorer` schema and that the migration history table is located at:

```text
trail_explorer.__EFMigrationsHistory
```

---

## 2. Docker

The backend is deployed as a container image pushed to Azure Container Registry.

### 2.1 Backend Dockerfile

The backend Dockerfile is located at:

```text
backend/Dockerfile
```

The current container uses:

```text
mcr.microsoft.com/dotnet/sdk:10.0
mcr.microsoft.com/dotnet/aspnet:10.0
```

The backend container listens on:

```text
8080
```

Therefore, the Azure container port must be set to:

```text
8080
```

Do not set it to `80`. The login request previously stayed pending because the Azure container setting was still using the default port `80`, while the ASP.NET app was actually listening on `8080`.

### 2.2 Build Image

Run this from the repository root:

```powershell
docker build -t trailexploreracr.azurecr.io/trail-explorer-backend:latest ./backend
```

### 2.3 Push Image to ACR

Log in to ACR:

```powershell
az acr login --name trailexploreracr
```

Push the image:

```powershell
docker push trailexploreracr.azurecr.io/trail-explorer-backend:latest
```

Production secrets should not be baked into the Docker image. They should be injected through Azure App Settings or Vercel Environment Variables.

---

## 3. Backend

The backend is deployed to Azure App Service for Linux container.

### 3.1 Azure Resource

Current Azure Web App:

```text
trail-explorer
```

### 3.2 Container Settings

Azure Deployment Center container settings:

```text
Image source: Azure Container Registry
Image: trail-explorer-backend
Tag: latest
Port: 8080
Startup command: empty
```

### 3.3 App Settings

Azure App Service requires at least these app settings:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
WEBSITES_PORT=8080
WEBSITES_CONTAINER_START_TIME_LIMIT=600
OpenApi__Enabled=true

ConnectionStrings__Postgres=<Supabase PostgreSQL connection string>

Jwt__Secret=<production JWT secret>
Jwt__Issuer=TrailExplorer
Jwt__Audience=TrailExplorerAPI
Jwt__AccessTokenExpirationMinutes=15
Jwt__RefreshTokenExpirationDays=7

GoogleOAuth__ClientId=<Google OAuth client id>

Cors__AllowedOrigins__0=https://trail-explorer-drab.vercel.app

DocApi__BaseUrl=https://api.doc.govt.nz
DocApi__ApiKey=

TrailSynchronisation__Enabled=false
TrailSynchronisation__RunOnStartup=false
TrailSynchronisation__IntervalHours=24
```

`Cors__AllowedOrigins__0` must use the Vercel production domain, not a Vercel deployment URL.

Production Vercel domain:

```text
https://trail-explorer-drab.vercel.app
```

### 3.4 CORS

The backend application already handles CORS:

```csharp
app.UseCors("Frontend");
```

Therefore, use Azure App Settings:

```text
Cors__AllowedOrigins__0=https://trail-explorer-drab.vercel.app
```

Leave the Azure CORS page under API empty for now. This project returns CORS headers from ASP.NET Core. If both Azure platform CORS and ASP.NET Core CORS are configured, duplicate headers or confusing behavior may occur.

### 3.5 Health Check

The backend exposes simple health check endpoints:

```text
GET /
GET /health
```

A successful response should be:

```json
{
  "status": "ok"
}
```

When Azure container settings, port configuration, or startup probes are failing, test this first:

```text
https://trail-explorer-ana8cshcfbbrc0ff.australiasoutheast-01.azurewebsites.net/health
```

If `/health` does not respond, fix backend or Azure container routing before investigating frontend or CORS.

### 3.6 Scalar API Documentation

OpenAPI and Scalar are available in Development by default. In Production, they are controlled by this app setting:

```text
OpenApi__Enabled=true
```

Enable this in Azure for submission so the Scalar API documentation can be accessed by markers. Disable it later if public API documentation is not required.

Expected documentation URLs:

```text
https://trail-explorer-ana8cshcfbbrc0ff.australiasoutheast-01.azurewebsites.net/openapi/v1.json
https://trail-explorer-ana8cshcfbbrc0ff.australiasoutheast-01.azurewebsites.net/scalar/v1
```

Use Scalar for the API documentation requirement. Do not use Swagger UI.

### 3.7 Observed Backend Logs

A successful startup should show:

```text
No migrations were applied. The database is already up to date.
Trail synchronisation background service is disabled.
Now listening on: http://[::]:8080
Application started.
Hosting environment: Production
```

---

## 4. Frontend

The frontend is deployed to Vercel by importing the GitHub repository.

### 4.1 Vercel Project Settings

Because the repository is a monorepo, Vercel must be pointed at the frontend folder:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

`Output Directory` is relative to `frontend`, so use `dist`, not `frontend/dist`.

### 4.2 Vercel Domains

Current production domain:

```text
https://trail-explorer-drab.vercel.app
```

CORS and Google OAuth production settings should use the production domain.

### 4.3 Vercel Environment Variables

Vercel requires:

```text
VITE_API_BASE_URL=https://trail-explorer-ana8cshcfbbrc0ff.australiasoutheast-01.azurewebsites.net/api
VITE_GOOGLE_CLIENT_ID=<Google OAuth client id>
```

`VITE_API_BASE_URL` is a build-time variable. After changing it, redeploy Vercel because existing deployments will not automatically receive the new value.

### 4.4 Google OAuth

Google login requires adding this Authorized JavaScript origin to the OAuth 2.0 Client ID in Google Cloud Console:

```text
https://trail-explorer-drab.vercel.app
```

Do not include a path and do not add a trailing `/`.

If this is not configured, the browser console shows:

```text
The given origin is not allowed for the given client ID.
```

This only affects the Google login button. It does not affect email/password login.

Allow about 5 minutes for the Google OAuth origin setting to take effect.

---

## Deployment Checklist

- Supabase schema `trail_explorer` exists.
- EF Core migration history is located at `trail_explorer.__EFMigrationsHistory`.
- Backend image has been built and pushed to ACR.
- Azure Deployment Center container port is `8080`.
- Azure App Settings include `WEBSITES_PORT=8080`.
- Azure App Settings include `ASPNETCORE_URLS=http://+:8080`.
- Azure App Settings include `WEBSITES_CONTAINER_START_TIME_LIMIT=600`.
- Azure App Settings include `OpenApi__Enabled=true` for submission.
- Azure App Settings include the production database connection string.
- Azure App Settings include production JWT settings.
- Azure App Settings include `Cors__AllowedOrigins__0=https://trail-explorer-drab.vercel.app`.
- Azure backend `/health` responds successfully.
- Azure backend Scalar documentation responds successfully.
- Vercel root directory is `frontend`.
- Vercel `VITE_API_BASE_URL` points to the Azure backend `/api`.
- Vercel has been redeployed after environment variable changes.
- Google OAuth Authorized JavaScript origins includes the Vercel production domain.
- Email/password register and login work.
- Frontend trail list loads from the backend.
- No production secrets are committed.

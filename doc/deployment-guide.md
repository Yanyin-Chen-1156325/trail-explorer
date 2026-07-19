# Trail Explorer Deployment Guide

This guide documents the production deployment SOP for Trail Explorer.

Target deployment:

* Frontend: Vercel
* Backend: Azure
* Database: Supabase PostgreSQL
* Production database schema: `trail_explorer`

Do not commit production secrets, database passwords, JWT secrets, OAuth secrets, or DOC API keys to the repository.

---

## 1. Production Database

Production uses Supabase PostgreSQL instead of the local SQLite database.

### 1.1 Create the Application Schema

In Supabase SQL Editor, run:

```sql
create schema if not exists trail_explorer;
```

The application uses `trail_explorer` instead of the default `public` schema.

### 1.2 Configure EF Core Schema

`ApplicationDbContext` should include:

```csharp
modelBuilder.HasDefaultSchema("trail_explorer");
```

The PostgreSQL provider configuration should also store EF Core migration history in the same schema:

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

This creates application tables and migration history under:

```text
trail_explorer.Users
trail_explorer.RefreshTokens
trail_explorer.Trails
trail_explorer.CheckIns
trail_explorer.Badges
trail_explorer.UserBadge
trail_explorer.__EFMigrationsHistory
```

### 1.3 Create PostgreSQL Migration

From the repository root:

```powershell
dotnet ef migrations add InitialPostgres --project backend --startup-project backend --output-dir Migrations
```

Check the generated migration contains:

```csharp
migrationBuilder.EnsureSchema(
    name: "trail_explorer");
```

and table creation using:

```csharp
schema: "trail_explorer"
```

### 1.4 Apply Migration

Option A: apply directly from local machine:

```powershell
dotnet ef database update --project backend --startup-project backend
```

Option B: generate SQL and execute it manually in Supabase:

```powershell
dotnet ef migrations script --project backend --startup-project backend -o postgres-init.sql
```

Then review and run `postgres-init.sql` in Supabase SQL Editor.

---

## 2. Environment Variables

### 2.1 Backend Environment Variables

Set these in Azure App Service or Azure Container Apps:

```text
ConnectionStrings__Postgres=<Supabase PostgreSQL connection string>
Jwt__Secret=<production JWT secret>
Jwt__Issuer=TrailExplorer
Jwt__Audience=TrailExplorerAPI
Jwt__AccessTokenExpirationMinutes=15
Jwt__RefreshTokenExpirationDays=7
GoogleOAuth__ClientId=<Google OAuth client id>
DocApi__BaseUrl=https://api.doc.govt.nz
DocApi__ApiKey=<DOC API key>
TrailSynchronisation__Enabled=false
TrailSynchronisation__RunOnStartup=false
TrailSynchronisation__IntervalHours=24
```

The connection string should use SSL:

```text
SSL Mode=Require;Trust Server Certificate=true
```

### 2.2 Frontend Environment Variables

Set this in Vercel:

```text
VITE_API_BASE_URL=https://<azure-backend-domain>/api
```

After changing Vercel environment variables, redeploy the frontend.

---

## 3. Docker SOP

The project roadmap includes Docker support. If Docker files are not present yet, create them before building images.

Expected files:

```text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
.dockerignore
```

### 3.1 Backend Dockerfile

Recommended backend image flow:

1. Restore .NET packages.
2. Build the ASP.NET Core project.
3. Publish the backend.
4. Run the published API with ASP.NET runtime.

The backend container must receive production configuration through environment variables, not committed JSON secrets.

### 3.2 Frontend Dockerfile

Recommended frontend image flow:

1. Install npm dependencies with `npm ci`.
2. Build the Vite app with `npm run build`.
3. Serve the built `dist` output with a static web server.

For production, the frontend can also be deployed directly to Vercel without a Docker image.

### 3.3 Local Docker Compose

Use Docker Compose for local smoke testing only. Production database should point to Supabase PostgreSQL, not a SQLite file inside the container.

Typical local commands:

```powershell
docker compose build
docker compose up
docker compose down
```

If using Supabase from Docker locally, pass the PostgreSQL connection string through environment variables:

```yaml
services:
  backend:
    environment:
      ConnectionStrings__Postgres: "${ConnectionStrings__Postgres}"
```

Do not bake database credentials into Docker images.

---

## 4. Azure Backend Deployment SOP

### 4.1 Prepare Backend

Verify the backend builds:

```powershell
dotnet build backend/backend.csproj
```

Verify migrations are up to date:

```powershell
dotnet ef migrations list --project backend --startup-project backend
```

### 4.2 Deploy Backend to Azure

Recommended options:

* Azure App Service for a straightforward ASP.NET Core deployment.
* Azure Container Apps if deploying a Docker image.

After deployment, configure Azure environment variables listed in section 2.1.

### 4.3 Verify Backend

Check:

```text
https://<azure-backend-domain>/openapi/v1.json
https://<azure-backend-domain>/scalar/v1
```

Also verify one API endpoint:

```text
GET https://<azure-backend-domain>/api/trails
```

---

## 5. Vercel Frontend Deployment SOP

### 5.1 Configure Project

In Vercel:

* Root directory: `frontend`
* Build command: `npm run build`
* Output directory: `dist`

### 5.2 Configure Environment

Set:

```text
VITE_API_BASE_URL=https://<azure-backend-domain>/api
```

### 5.3 Verify Frontend

Check:

* The Vercel site loads.
* Login and registration call the Azure backend.
* Trail discovery loads from the backend.
* SignalR leaderboard connection works.

---

## 6. Deployment Checklist

Before final submission:

* Supabase schema `trail_explorer` exists.
* PostgreSQL migration has been applied.
* `trail_explorer.__EFMigrationsHistory` exists.
* Azure backend has `ConnectionStrings__Postgres`.
* Azure backend has production JWT, Google OAuth, and DOC API settings.
* Backend public URL responds.
* Vercel has `VITE_API_BASE_URL`.
* Frontend public URL loads.
* CORS allows the Vercel frontend domain.
* Authentication flow works.
* Trail list API works.
* Check-in flow writes data to Supabase.
* No production secrets are committed.

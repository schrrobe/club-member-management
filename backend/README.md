# Backend

Express + TypeScript Backend mit Prisma und lokaler PostgreSQL über Docker Compose.

## Voraussetzungen

- Node.js + pnpm
- Docker + Docker Compose (`docker compose`)

## Projektstruktur

```
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
      db.ts
    routes/
      index.ts
      user.routes.ts
      club.routes.ts
    controllers/
      user.controller.ts
      club.controller.ts
      membership.controller.ts
    services/
      user.service.ts
      club.service.ts
      membership.service.ts
    models/
      user.model.ts
      club.model.ts
      membership.model.ts
      role.model.ts
      permission.model.ts
    repositories/
      user.repository.ts
      club.repository.ts
      membership.repository.ts
      role.repository.ts
      permission.repository.ts
    middlewares/
      error.middleware.ts
      auth.middleware.ts
      cors.middleware.ts
      rate-limit.middleware.ts
    utils/
      logger.ts
      ip-allowlist.ts
    types/
      express.d.ts
  prisma/
    schema.prisma
  dist/
  .env.local
  .env.stage
  .env.prod
  package.json
  tsconfig.json
```

## Environment / Konfiguration

Dieses Backend lädt automatisch eine Env-Datei:

- `APP_ENV=local` → `backend/.env.local`
- `APP_ENV=stage` → `backend/.env.stage`
- `APP_ENV=prod` → `backend/.env.prod`
- Fallback: `backend/.env`

Wichtige Variablen:

- `PORT` (default `3000`)
- `DATABASE_URL` (Prisma)
- `CORS_ORIGINS` (CSV Liste, z.B. `https://app.example.com,https://admin.example.com`)
- `TRUST_PROXY` (z.B. `1` hinter Nginx/Traefik)
- `RATE_LIMIT_LIMIT` (default `200`)
- `RATE_LIMIT_WINDOW_MS` (default `900000`)
- `RATE_LIMIT_ALLOWLIST` (CSV, IPs/CIDR z.B. `127.0.0.1,10.0.0.0/8`)
- `JWT_SECRET` (mind. 16 Zeichen; in `local/prod` nicht committen)
- `JWT_EXPIRES_IN_SECONDS` (default `86400`)

## Lokale Datenbank (Postgres via Docker)

Im Monorepo-Root liegt eine `docker-compose.yml` mit einem PostgreSQL-Container.

Start/Stop im Root:

```bash
pnpm run db:up
pnpm run db:logs
pnpm run db:down
```

Default Zugangsdaten (lokal):

- DB: `club_member`
- User: `postgres`
- Passwort: `postgres`
- Host/Port: `localhost:5432`

`backend/.env.local` ist darauf vorkonfiguriert:

`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/club_member?schema=public"`

### Wo sind die Daten?

Die Datenbank liegt nicht als Datei im Repo, sondern in einem Docker Volume:

- Volume: `postgres_data` (siehe `docker-compose.yml`)

Hilfreiche Commands:

```bash
docker volume ls | grep postgres_data
docker volume inspect postgres_data
```

PSQL im Container:

```bash
docker exec -it club_member_postgres psql -U postgres -d club_member
```

### DB in DBeaver öffnen

Du kannst Postgres in DBeaver verbinden, obwohl es im Docker Container läuft (Port ist auf `localhost:5432` gemappt).

- DB-Typ: PostgreSQL
- Host: `localhost`
- Port: `5432`
- Database: `club_member`
- User: `postgres`
- Password: `postgres`

JDBC URL:

`jdbc:postgresql://localhost:5432/club_member`

## Prisma Setup

Wichtig: Prisma benötigt generierte Artefakte. Falls `prisma generate` fehlschlägt, liegt es meist daran, dass Prisma Engines aus dem Internet geladen werden müssen.

Empfohlene Schritte:

```bash
# Prisma Client generieren
pnpm -C backend db:generate

# Migrationen (lokal) anwenden + DB erstellen/aktualisieren
pnpm -C backend db:migrate

# Studio öffnen (optional)
pnpm -C backend db:studio
```

## IDs (UUID)

Users nutzen UUIDs als IDs. Beim `POST /users` wird serverseitig mit dem `uuid`-Package eine ID erzeugt.

Wenn du bereits Migrationen/Tabellen mit Integer-IDs hattest, musst du die Migration entsprechend neu erstellen/anpassen.

## Backend starten

Development (watch + nodemon):

```bash
APP_ENV=local pnpm -C backend dev
```

Build + Start:

```bash
pnpm -C backend build
APP_ENV=local pnpm -C backend start
```

Healthcheck:

```bash
curl http://localhost:3000/health
```

## Backend starten

  1. Postgres starten (im Repo-Root):

  - pnpm run db:up

  2. Prisma Client + Migration (im Repo-Root):

  - pnpm -C backend db:generate
  - pnpm -C backend db:migrate

  3. Backend starten:

  - APP_ENV=local pnpm -C backend dev
    (oder: APP_ENV=local pnpm -C backend start)

  4. Testen, ob DB-Kommunikation klappt:

  - Health: curl http://localhost:3000/health
  - User anlegen (schreibt in DB):
      - curl -X POST http://localhost:3000/users -H 'content-type: application/
        json' -d '{"email":"test@example.com","name":"Test"}'
  - User lesen (liest aus DB):
      - curl http://localhost:3000/users

  Optional direkt in Postgres prüfen:

  - docker exec -it club_member_postgres psql -U postgres -d club_member -c
    "select * from \"User\";"


## API Endpoints (aktuell)

- `GET /health` → `{ ok: true }`
- `POST /auth/register` → User registrieren + Token
  - Body: `{ "email": "a@b.de", "password": "..." , "name": "Alice" }`
- `POST /auth/login` → Token holen
  - Body: `{ "email": "a@b.de", "password": "..." }`
- `GET /auth/me` → eingeloggter User (Bearer Token)
- `GET /users` → Liste aller Users (Prisma)
- `POST /users` → User anlegen
  - Body: `{ "email": "a@b.de", "name": "Alice" }`
- `GET /users/me/clubs` → Alle Vereine, in denen ich Mitglied bin (Bearer Token)
- `GET /users/:userId/clubs` → Alle Vereine eines Users (Admin API Key)
  - Header: `Authorization: Bearer <token>`
  - Header: `x-admin-key: <ADMIN_API_KEY>`
- `GET /clubs` → Liste aller Vereine
- `POST /clubs` → Verein anlegen (Ersteller wird automatisch `admin`-Mitglied)
  - Auth: `Authorization: Bearer <token>`
  - Body: `{ "name": "Mein Verein" }`
- `GET /clubs/:clubId/members` → Mitglieder inkl. Rollen
- `POST /clubs/:clubId/members` → User als Mitglied hinzufügen
  - Body: `{ "userId": "<USER_ID>" }`
- `PUT /clubs/:clubId/members/:userId/roles` → Rollen für Mitglied setzen (replace)
  - Body: `{ "roles": ["member", "vorstand"] }`
- `GET /clubs/:clubId/members/:userId/permissions` → Effektive Permissions (aus Rollen + Mitglied-Overrides)

Beispiel:

```bash
curl -X POST http://localhost:3000/users \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","name":"Test"}'
```

### Beispiel: Verein erstellen + Rollen/Permissions testen

```bash
# 0) JWT_SECRET setzen (nur lokal, nicht committen)
# backend/.env.local:
# JWT_SECRET="CHANGE_ME_LONG_RANDOM_SECRET"

# 1) Registrieren + Token holen
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register -H 'content-type: application/json' -d '{"email":"owner@example.com","password":"supersecret123","name":"Owner"}' | jq -r '.token')

# 1b) User-ID aus /auth/me holen
USER_ID=$(curl -s http://localhost:3000/auth/me -H "Authorization: Bearer ${TOKEN}" | jq -r '.id')

# 2) Verein anlegen (Owner wird automatisch Mitglied + admin)
CLUB_ID=$(curl -s -X POST http://localhost:3000/clubs -H 'content-type: application/json' -H "Authorization: Bearer ${TOKEN}" -d "{\"name\":\"Testverein\"}" | jq -r '.club.id')

# 3) Mitglieder ausgeben (sollte den Owner enthalten)
curl -s "http://localhost:3000/clubs/${CLUB_ID}/members" -H "Authorization: Bearer ${TOKEN}" | jq

# 4) Effektive Permissions (admin)
curl -s "http://localhost:3000/clubs/${CLUB_ID}/members/${USER_ID}/permissions" -H "Authorization: Bearer ${TOKEN}" | jq
```

## Linting / Formatting

Im Monorepo-Root:

```bash
pnpm run lint
```

Prettier ist optional; wenn installiert:

```bash
pnpm run format:backend
```

## Troubleshooting

### `DATABASE_URL is not set`

- Stelle sicher, dass `APP_ENV` gesetzt ist (z.B. `APP_ENV=local`) und `backend/.env.local` existiert.

### Prisma Client nicht generiert

Wenn `/users` einen Fehler wie „Prisma Client is not generated“ liefert:

- `pnpm -C backend db:generate`
- danach `pnpm -C backend db:migrate`

### Prisma 7 Hinweis (Config + Adapter)

Mit Prisma 7 wird die `DATABASE_URL` für CLI-Kommandos über `backend/prisma.config.ts` gelesen (nicht mehr über `url = env(...)` in `schema.prisma`).

Für die App-Anbindung an PostgreSQL wird der Adapter benötigt:

```bash
pnpm add -C backend @prisma/adapter-pg pg
```

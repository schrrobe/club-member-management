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
    controllers/
      user.controller.ts
    services/
      user.service.ts
    models/
      user.model.ts
    repositories/
      user.repository.ts
    middlewares/
      error.middleware.ts
      auth.middleware.ts
    utils/
      logger.ts
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
- `GET /users` → Liste aller Users (Prisma)
- `POST /users` → User anlegen
  - Body: `{ "email": "a@b.de", "name": "Alice" }`

Beispiel:

```bash
curl -X POST http://localhost:3000/users \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","name":"Test"}'
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

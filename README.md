# Banking Ledger

A simple banking ledger backend — user auth, accounts, and transactions — built with Node.js, TypeScript, Express, and MongoDB.

## Tech stack

- **Runtime:** Node.js 22, TypeScript (ESM, compiled with `tsc`)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (cookie or `Authorization: Bearer` header), bcrypt password hashing
- **Docs:** Swagger UI (OpenAPI 3) at `/api-docs`
- **Containerization:** Docker + Docker Compose (multi-stage build)

## Project structure

```
server.ts                  # entrypoint — loads env, connects DB, starts app
src/
  app.ts                   # express app + route mounting
  config/
    db.ts                  # mongoose connection
    swagger.ts             # swagger-jsdoc spec builder
  docs/
    openapi.docs.ts        # all @openapi path definitions (kept out of route files)
  controller/               # request handlers
  routes/                   # route wiring (auth, accounts, transactions, health)
  middleware/
    auth.middleware.ts      # authMiddleware, authSystemUserMiddleware
  model/                    # mongoose schemas (user, account, transaction, ledger, counter, token blacklist)
  services/
    email.service.ts        # registration email via nodemailer
```

## Prerequisites

- Node.js 22+ and npm (only needed for local, non-Docker dev)
- Docker + Docker Compose (recommended path)
- A MongoDB instance — either the `mongodb` service in `docker-compose.yml`, or a hosted one (e.g. MongoDB Atlas)

## Environment variables

Create a `.env` file in the project root (never commit this — it's gitignored):

| Variable         | Description                                              |
|------------------|------------------------------------------------------------|
| `PORT`           | Port the app listens on (e.g. `3000`)                     |
| `MONGODB_URI`    | MongoDB connection string                                  |
| `JWT_SECRET`     | Secret used to sign JWTs                                    |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`)                                      |
| `CLIENT_ID`      | Google OAuth client ID (used for sending mail via Gmail API)|
| `CLIENT_SECRET`  | Google OAuth client secret                                  |
| `REFRESH_TOKEN`  | Google OAuth refresh token                                  |
| `EMAIL_USER`     | Gmail address used as the sender for registration emails    |

## Running locally (without Docker)

```bash
npm install
npm run dev        # tsx watch — hot reload
```

```bash
npm run build       # compiles TypeScript to dist/
npm start            # runs dist/server.js
```

Requires a reachable `MONGODB_URI` (local Mongo or Atlas).

## Running with Docker Compose (recommended)

```bash
docker compose up -d --build
docker compose logs -f backend   # follow logs
docker compose ps                 # check container status
docker compose down               # stop and remove containers
```

This starts two services:
- `backend` — the app, built from the local `Dockerfile`, port mapped as `${PORT}:${PORT}` (reads `PORT` from `.env`, defaults to `3000` if unset)
- `mongodb` — Mongo 8 with a persistent `mongo-data` volume, port `27017`

> The host port always matches whatever `PORT` is set to in `.env` — change `.env`, not `docker-compose.yml`, if you want a different port.

## API reference

Once running, interactive docs are at:

```
http://localhost:<PORT>/api-docs
```

Health check (also useful as an ALB/EC2 health check target):

```
GET /health   ->  { status: "ok" | "degraded", db: "connected" | "disconnected", uptime, timestamp }
```

### Auth — `/api/auth`

| Method | Path              | Auth | Description                          |
|--------|-------------------|------|----------------------------------------|
| POST   | `/register`       | —    | Create a user, sends a welcome email  |
| POST   | `/login`          | —    | Returns a JWT (also set as a cookie)  |
| POST   | `/logout`         | —    | Blacklists the current token           |
| GET    | `/user/:id`       | —    | Fetch a user by numeric id (`USER-{id}`) |

### Accounts — `/api/accounts` (all require auth)

| Method | Path                     | Description                  |
|--------|--------------------------|-------------------------------|
| POST   | `/`                      | Create a new account          |
| GET    | `/`                      | List accounts for current user|
| GET    | `/balance/:accountId`    | Get an account's balance       |

### Transactions — `/api/transactions`

| Method | Path                        | Auth              | Description                            |
|--------|-----------------------------|-------------------|------------------------------------------|
| POST   | `/`                         | user              | Create a transaction between accounts   |
| POST   | `/system/initial-funds`     | system user only  | Seed initial funds into the system account |

### Authentication

Send the JWT either as a cookie named `token` (set automatically on login) or as `Authorization: Bearer <token>` — the middleware checks both. System-only routes additionally require the user's `systemUser` flag to be set.

## Deploying to AWS EC2 (Ubuntu)

1. **Launch an EC2 instance** (Ubuntu, e.g. `t3.micro`) and note its public IP.
2. **SSH in:**
   ```bash
   ssh -i your-key.pem ubuntu@<ec2-public-ip>
   ```
3. **Install Docker:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER   # log out/in after this
   ```
4. **Clone the repo and add `.env`:**
   ```bash
   git clone <repo-url>
   cd BankingLedger
   nano .env   # paste in the variables from the table above
   ```
5. **Build and run:**
   ```bash
   docker compose up -d --build
   docker compose logs -f backend
   ```
6. **Open the app's port in the EC2 security group:**
   AWS Console → EC2 → your instance → **Security** tab → security group → **Edit inbound rules** → **Add rule** → Type **Custom TCP**, Port range = your `PORT` value, Source `0.0.0.0/0` (or restrict to your IP).

   > If you pick port `80`, no security-group rule is usually needed beyond the default HTTP rule, and you can drop the `:PORT` from the URL entirely. The container runs as root, so binding to port 80 works without extra config.
7. **Access:**
   ```
   http://<ec2-public-ip>:<PORT>/health
   http://<ec2-public-ip>:<PORT>/api-docs
   ```

## Troubleshooting

- **Browser hangs / times out hitting the public IP:** almost always the EC2 **security group** — the app's port isn't open inbound. Add a Custom TCP rule for it.
- **`docker compose ps` shows nothing running:** check `docker compose logs backend` for a crash (commonly a bad/missing `MONGODB_URI`).
- **App connects on `PORT` X but URL uses port Y:** `docker-compose.yml` maps `${PORT}:${PORT}` from `.env` — make sure you're hitting the same port that's actually in `.env` on the server (it can differ from your local `.env`).
- **Confirm the app is actually listening**, from inside the instance:
  ```bash
  curl -s localhost:$PORT/health
  sudo ss -tlnp | grep $PORT
  ```
  If this works locally but not from your browser, it's the security group, not the app.
- **Public IP changed:** without an Elastic IP, EC2 reassigns the public IP on stop/start — check AWS Console → EC2 → Instances for the current one.

## Security notes

- `.env` is gitignored — never commit real secrets. Copy the variable names above and fill in your own values on each environment.
- The `mongo-data` Docker volume persists DB data across `docker compose down`/`up` — use `docker compose down -v` only if you intentionally want to wipe it.
- The `mongodb` service's port `27017` is exposed to the host — restrict it in the security group (or drop the port mapping entirely) if MongoDB shouldn't be reachable from outside the container network.

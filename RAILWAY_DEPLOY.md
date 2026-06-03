# Railway Deployment Guide

Step-by-step instructions to deploy both the **FastAPI backend** and the **React frontend** on Railway from a single GitHub repository.

---

## Architecture on Railway

```
Railway Project: InvenTrack
├── Service: backend       (FastAPI — Root: backend/)
├── Service: frontend      (React/Nginx — Root: frontend/)
└── Plugin:  PostgreSQL    (managed database)
```

- The **backend** connects to the Railway PostgreSQL plugin via `DATABASE_URL` (auto-injected).
- The **frontend** talks to the backend via `VITE_API_URL` (you set this after backend is deployed).
- Both services pull from the **same GitHub repo**.

---

## Prerequisites

- [ ] A [Railway account](https://railway.app) (free tier works)
- [ ] The code pushed to a **GitHub repository**
- [ ] Railway CLI installed (optional but useful): `npm install -g @railway/cli`

---

## Step 1 — Create a Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **Empty Project**
3. Give it a name, e.g. `inventrack`

---

## Step 2 — Add PostgreSQL Database

1. Inside your project, click **+ New** → **Database** → **PostgreSQL**
2. Railway provisions a PostgreSQL 15 instance automatically
3. Click on the PostgreSQL service → **Variables** tab
4. Note the `DATABASE_URL` value — Railway will inject it into your backend automatically when you link them

---

## Step 3 — Deploy the Backend

### 3a. Add the backend service

1. Click **+ New** → **GitHub Repo**
2. Select your repository
3. Set **Root Directory** → `backend`
4. Railway detects `backend/Dockerfile` → click **Deploy**

### 3b. Link PostgreSQL to the backend

1. Click the backend service → **Variables** tab
2. Click **+ Add a Reference** → select the **PostgreSQL** plugin
3. Choose `DATABASE_URL` → this injects the DB connection string automatically

### 3c. Set backend environment variables

In the backend service → **Variables** tab, add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | *(linked from PostgreSQL)* | Already set in 3b |
| `ALLOWED_ORIGINS` | `https://your-frontend.up.railway.app` | Set after frontend URL is known; use `*` temporarily |
| `JWT_SECRET_KEY` | *(generate a strong random string)* | e.g. `openssl rand -hex 32` |
| `DEBUG` | `false` | |
| `ENVIRONMENT` | `production` | |

**Generate a secure JWT secret key:**
```bash
# Run this locally and copy the output
python -c "import secrets; print(secrets.token_hex(32))"
# or
openssl rand -hex 32
```

### 3d. Verify backend deployment

After the build succeeds, click the backend service → **Settings** → copy the **Public Domain** URL (e.g. `https://backend-xxxx.up.railway.app`).

Test it:
```bash
curl https://backend-xxxx.up.railway.app/health
# Expected: {"status":"healthy","version":"1.0.0"}
```

Browse the API docs: `https://backend-xxxx.up.railway.app/docs`

> **First boot:** `start.sh` waits for the DB, runs `alembic upgrade head`, then seeds `testUser / Test1234` and `admin / Admin@1234` automatically.

---

## Step 4 — Deploy the Frontend

### 4a. Add the frontend service

1. Click **+ New** → **GitHub Repo**
2. Select the **same repository**
3. Set **Root Directory** → `frontend`
4. Railway detects `frontend/Dockerfile` → **don't deploy yet**

### 4b. Set frontend environment variables

In the frontend service → **Variables** tab, add:

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://backend-xxxx.up.railway.app` | Your backend Railway URL from Step 3d |

> **Important:** `VITE_API_URL` is a **build-time** variable. Changing it requires a **redeploy** of the frontend. `railway.toml` passes it to Docker as a build arg automatically.

### 4c. Deploy frontend

Click **Deploy** (or push a commit — Railway auto-deploys on push to `main`).

### 4d. Get frontend URL

Frontend service → **Settings** → **Public Domain** → e.g. `https://frontend-xxxx.up.railway.app`

---

## Step 5 — Update CORS on Backend

Now that you have the frontend URL:

1. Backend service → **Variables**
2. Update `ALLOWED_ORIGINS` → `https://frontend-xxxx.up.railway.app`
3. Railway automatically redeploys on variable change

---

## Step 6 — Verify End-to-End

1. Open `https://frontend-xxxx.up.railway.app`
2. Login with `testUser / Test1234` (regular user)
3. Login with `admin / Admin@1234` (admin — sees 🛡️ badge and order status management)
4. Create a product, place an order, change order status as admin

---

## Environment Variables Reference

### Backend Service

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | *(auto from plugin)* | PostgreSQL connection string |
| `ALLOWED_ORIGINS` | ✅ | `https://app.up.railway.app` | Frontend URL for CORS |
| `JWT_SECRET_KEY` | ✅ | `abc123...` (64 hex chars) | Secret for signing JWT tokens |
| `DEBUG` | ✅ | `false` | Disable SQL logging in prod |
| `ENVIRONMENT` | ✅ | `production` | |
| `JWT_ALGORITHM` | ❌ | `HS256` | Default — no need to set |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | Default — no need to set |

### Frontend Service

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | ✅ | `https://backend.up.railway.app` | Backend base URL — baked in at build time |

---

## Redeployment

### On every `git push` to `main`
Railway redeploys both services automatically (if auto-deploy is enabled).

### Force a redeploy manually
Railway dashboard → service → **Deployments** → **Deploy** button  
Or via CLI:
```bash
railway up --service backend
railway up --service frontend
```

### After changing environment variables
Railway automatically triggers a redeploy for runtime variables.  
For `VITE_API_URL` (build-time), you must manually redeploy the frontend after changing it.

---

## Custom Domains

1. Service → **Settings** → **Domains** → **+ Custom Domain**
2. Add your domain (e.g. `api.yourdomain.com` for backend, `app.yourdomain.com` for frontend)
3. Add the CNAME record shown by Railway to your DNS provider
4. Railway provisions a free TLS certificate automatically

---

## Troubleshooting

### Backend: "database did not become ready"
- Check PostgreSQL plugin is running: Railway dashboard → PostgreSQL → **Metrics**
- Check `DATABASE_URL` is linked correctly: backend Variables tab
- Increase retries in `start.sh` if your DB takes longer to provision

### Backend: 500 on `/api/v1/dashboard/summary`
- Run `alembic upgrade head` — a migration may be missing
- Check logs: Railway → backend service → **Logs**

### Frontend: blank page or network errors
- Check `VITE_API_URL` is set correctly (no trailing slash)
- Confirm `ALLOWED_ORIGINS` on backend includes the frontend URL
- Open browser DevTools → Network tab for CORS errors

### Login: "Invalid username/email or password" for admin
```bash
# Reset admin password locally:
cd backend && venv\Scripts\activate
python -c "
import asyncio
async def fix():
    from app.core.database import AsyncSessionLocal
    from app.core.deps import hash_password
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        h = hash_password('Admin@1234')
        await db.execute(text(\"UPDATE users SET hashed_password = :h, is_admin = TRUE WHERE username = 'admin'\"), {'h': h})
        await db.commit()
        print('Done.')
asyncio.run(fix())
"
```
Or in Railway's shell: **railway run python -c "..."**

### Frontend: old API URL after updating `VITE_API_URL`
`VITE_API_URL` is baked in at Docker build time. After changing it in Railway variables:
1. Redeploy the frontend service manually

---

## Useful Railway CLI Commands

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link local repo to Railway project
railway link

# View logs live
railway logs --service backend
railway logs --service frontend

# Open a shell inside a running service
railway shell --service backend

# Run a one-off command (e.g. DB check)
railway run --service backend python -c "print('hello')"

# List all services
railway status
```

---

## Cost Estimate (Railway)

| Resource | Free Tier | Notes |
|---|---|---|
| Compute hours | 500 hrs/month | ~21 days of always-on |
| PostgreSQL | 1 GB storage | Sufficient for this app |
| Bandwidth | 100 GB/month | |
| Custom domains | Free | With TLS |

For a production app with consistent traffic, upgrade to the **Pro plan** ($20/month) for unlimited compute.

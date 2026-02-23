# IPL Auction Game — Render Deployment Guide

## Project Structure

```
1.2/
├── ipl-auction-game/
│   ├── backend/          (Express + Socket.io server)
│   └── frontend/         (React + Vite SPA)
├── package.json          (root forwarding scripts)
├── render.yaml           (Render multi-service config)
└── .env.example          (environment variable reference)
```

## Render Services

This project deploys two services on Render:

### 1. Frontend Service (`ipl-auction-frontend`)
- **Type:** Web Service
- **Build Command:** Installs devDependencies and builds Vite app to `dist/`
- **Start Command:** Runs `vite preview` to serve the built frontend
- **Environment:** `NODE_ENV=production`

### 2. Backend Service (`ipl-auction-backend`)
- **Type:** Web Service
- **Build Command:** Installs dependencies only (no build step)
- **Start Command:** Runs Node.js server that:
  - Serves the frontend static files from `/dist`
  - Provides Socket.io API for auction logic
- **Environment:** `NODE_ENV=production`, `PORT=3001`

## Key Configuration Details

### Frontend (Vite)
- **Port Support:** Respects `PORT` environment variable; defaults to 5173 for local dev
- **Build Output:** Static files to `dist/` folder
- **Preview Mode:** Uses `vite preview` to serve built app in production

### Backend (Express + Socket.io)
- **Port:** Respects `PORT` env var; defaults to 3001
- **CORS:** Configured to allow all origins (suitable for same-origin deployment)
- **Static Serving:** Automatically serves frontend `dist/` files and SPA routing via fallback to `index.html`
- **Socket.io:** Handles real-time auction events and room management

## Deployment Checklist

- ✅ All files committed to GitHub (`git push`)
- ✅ `render.yaml` defines both services
- ✅ Frontend builds successfully: `yarn build`
- ✅ Backend starts: `node server/index.js`
- ✅ Environment variables set in Render dashboard
- ✅ No hardcoded URLs (uses relative socket connections)

## Local Development

```bash
# Frontend (dev mode)
cd 1.2/ipl-auction-game/frontend
yarn install
yarn dev          # Runs on http://localhost:5173

# Backend (in another terminal)
cd 1.2/ipl-auction-game/backend
yarn install
yarn start        # Runs on http://localhost:3001
```

## Troubleshooting

### Build fails with "vite: not found"
→ Ensure `render.yaml` includes `--production=false` in frontend `buildCommand`

### Frontend can't connect to backend
→ Check Socket.io CORS settings in backend; currently allows all origins

### Port conflicts
→ Backend uses `PORT` env var (Render assigns automatically); frontend uses same for `vite preview`

## Next Steps

1. Push this guide and config changes to GitHub
2. On Render dashboard, link this repository
3. Create/configure services according to `render.yaml`
4. Set environment variables in Render service settings
5. Trigger a deploy and monitor build logs

# IPL Auction Game

## Project Structure

```
ipl-auction-game/
├── frontend/          # React + Vite app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node + Express + Socket.IO
│   ├── server/
│   └── package.json
├── package.json       # Root scripts
└── render.yaml        # Render deployment config
```

## Development

Install all dependencies:
```bash
npm run install:all
```

Run both frontend and backend:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Build & Deploy

Build frontend:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Deploy on Render:
- Push to GitHub
- Render will use `render.yaml`
- Builds frontend and serves from backend

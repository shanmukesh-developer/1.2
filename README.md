<div align="center">

# 🏏 IPL Auction Game - Real-time Multiplayer Simulator

A high-performance, real-time multiplayer web application simulating the **Indian Premier League (IPL) Auction**. Users can join lobby rooms, bid on players, manage team rosters, track budgets, and experience the thrill of a live cricket auction.

[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node%20%2F%20Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-010101?style=flat-square&logo=socketdotio)](https://socket.io)
[![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com)

</div>

---

## 🌟 Key Features

- **Real-Time Bidding**: Powered by Socket.IO, allowing instantaneous bid updates, countdown clocks, and active bidder tracking across all connected clients.
- **Multilobby Rooms**: Users can create or join specific auction rooms using unique room IDs.
- **Dynamic Team Roster Management**: Automatic calculation of team budget, slots filled, foreign player limits, and base price validations.
- **Interactive Dashboard**: Modern UI showing the current player up for bidding, stats (run rate, wickets, role), bidding history, and active bidder status.
- **Live Leaderboard**: Real-time ranking of constructed teams based on team strength and remaining budget.

---

## 🏗️ System Architecture

```
ipl-auction-game/
├── frontend/          # React + Vite Client Application
│   ├── src/           # UI Components, Hooks, and State Management
│   └── package.json
│
├── backend/           # Node.js + Express Server
│   ├── server/        # Game engine, Socket room controllers, and Player pool
│   └── package.json
│
├── package.json       # Root script manager for monorepo development
└── render.yaml        # Blueprint for one-click cloud deployment
```

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js (v16+)
- npm (v8+)

### 1. Install Dependencies
Run the command below in the root folder to install all packages for both frontend and backend automatically:
```bash
npm run install:all
```

### 2. Run in Development Mode
To start both the client and server concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & WebSockets**: `http://localhost:3001`

### 3. Production Build & Server Start
To build the static React assets and run the Express production server:
```bash
npm run build
npm start
```

---

## ☁️ Deployment

This project is configured for direct deployment to **Render** using the provided `render.yaml` blueprint. The build script automatically packages the React frontend, copies it to the backend public directory, and serves it statically under a single Node server instance.

---

## 🛠️ Tech Arsenal

- **Frontend**: React, Vite, HTML5, CSS3, ES6+ JavaScript
- **Backend**: Node.js, Express.js, Socket.IO
- **Tooling**: Concurrent Dev Runners, ESLint, Git

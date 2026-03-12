# PFE – Ibn Khaldoun University Platform

Full-stack university management platform built with React, Express, and Tailwind CSS.

## Structure

```
PFE/
├── frontend/   → React 19 + Tailwind CSS frontend
├── backend/    → Node.js + Express API server
└── .github/    → CI / collaboration config
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm start        # → http://localhost:3000
```

### Backend
```bash
cd backend
npm install
npm run dev      # → http://localhost:5000
```

## Collaboration

- **Never** commit `node_modules/` or `.env` files.
- Run `npm install` inside both `frontend/` and `backend/` after cloning.
- Create a `.env` file in `backend/` with `PORT=5000` (see `backend/README.md`).

See each folder's `README.md` for more details.

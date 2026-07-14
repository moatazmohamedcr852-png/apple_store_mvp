# Apple Store

Full-stack stickers shop (React frontend + Express/MongoDB backend).

## Quick start (for collaborators)

```bash
# 1. Clone
git clone https://github.com/moatazmohamedcr852-png/apple_store_mvp.git
cd apple_store_mvp

# 2. Install dependencies (root + BE + FE)
npm run setup

# 3. Environment files
cp BE/.env.example BE/.env
cp FE/.env.example FE/.env

# Edit BE/.env — at minimum set a working MONGODB_URI
# (and Cloudinary / SMTP / Telegram keys if you need uploads, emails, or notifications)

# 4. Make sure MongoDB is running locally, OR put your Atlas URI in BE/.env

# 5. Start backend + frontend together
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3000  
- Admin login uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `BE/.env`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install root, BE, and FE dependencies |
| `npm run dev` | Run API + Vite together |
| `npm run build` | Build BE (TypeScript) and FE (Vite) |

## Project layout

- `BE/` — Express + TypeScript + MongoDB API
- `FE/` — React + Vite storefront

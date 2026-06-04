# CrowdFix Nepal 🇳🇵

> Community Problem Reporting Platform — citizens report local civic issues (potholes, broken streetlights, garbage, water leaks), reports are geotagged and routed to the relevant municipality (KMC, LSMC, Bhaktapur) for resolution.

## 👥 Team

| Name | Role |
|---|---|
| Sapkota Pratik | Project Lead / Backend Developer |
| Bhote Umang | Frontend Developer |
| BK Dol Bahadur | UI/UX Designer |
| Basnet Anjali | QA / Database Engineer |

Department of Information Security

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express + Prisma ORM |
| Database | PostgreSQL 17 |
| Auth | JWT (1h expiry) + bcrypt |
| File Storage | Cloudinary |
| Maps | Leaflet + OpenStreetMap |
| Email | Nodemailer + Gmail SMTP |
| Hosting | Vercel (frontend) + Render (backend + DB) |
| CI/CD | GitHub Actions |

## 📂 Structure

```
crowdfix/
├── frontend/      # React app (Vite)
├── backend/       # Express REST API
├── database/      # Schema, seeds, migrations
├── docs/          # SRS, mockup, RTM, diagrams
└── README.md
```

## 🌿 Branching

- `main` — protected, release-ready
- `dev` — integration branch
- `feat/<name>` — feature branches

All PRs target `dev`. `dev → main` only at release tags.

## 📝 Commit Convention

`<type>(<scope>): <short description>` — types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`.

Example: `feat(auth): add JWT login endpoint`

## 📄 License

MIT

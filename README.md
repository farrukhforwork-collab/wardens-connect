# Wardens Connect

Private social & welfare platform for Punjab Traffic Wardens (invite-only).

## Project Structure

- `frontend` React (Vite) + Tailwind + PWA
- `backend` Node.js + Express + MongoDB + Socket.io

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Notes
- Create users via Admin APIs only (no public registration).
- Login uses either official email OR `serviceId + CNIC` (hashed).
- Storage provider: set `STORAGE_PROVIDER` to `s3` or `firebase`.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Default Seeded Admin

- Email: `superadmin@wardens.local`
- Service ID: `HQ-0001`
- CNIC: `12345-6789012-3`

## Key Modules

- Feed/Posts (text, media, categories, pin)
- Real-time Chat (groups, socket.io)
- Pages (official + community)
- Welfare Dashboard (income/expense ledger)
- Admin Panel (approvals, reports)

## Security Highlights

- JWT auth + RBAC
- Admin approval required before activation
- Encrypted CNIC hash
- Audit logs for critical actions

## Environment Variables

See `.env.example` in each folder.

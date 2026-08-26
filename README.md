# Land Valuation System — Frontend

The React frontend for the **CODEHUB Land Valuation System**, an academic project by **ZV × FIT — Group 18**. The application supports the land-valuation workflow from the initial public request through inspection, staged management review, payment, and final report access.

This repository contains the user interface. The full application also requires the [Land Valuation Backend](https://github.com/Valuation-System-Project-ZV-x-FIT-G18/Land-Valuation-Backend).

## Repository links

- [Frontend repository — `dev` branch](https://github.com/Valuation-System-Project-ZV-x-FIT-G18/Land-Valuation-Frontend/tree/dev)
- [Backend repository — `dev` branch](https://github.com/Valuation-System-Project-ZV-x-FIT-G18/Land-Valuation-Backend/tree/dev)

Use the `dev` branch in both repositories to review the latest project version.

## Main workflow

1. A loan applicant submits a valuation request.
2. A coordinator registers the applicant, creates a project, and assigns a technical officer.
3. The technical officer records inspection information, GPS data, site photographs, nearby-land evidence, and the draft valuation report.
4. Managers L3, L2, and L1 review the report in stages.
5. The applicant submits the payment slip after final approval.
6. The bank accesses the completed report after payment verification.

## User roles

| Role | Main responsibilities |
| --- | --- |
| Loan Applicant | Submit requests and project details, upload documents, and submit payment evidence |
| Coordinator | Register applicants, create projects, assign officers, and monitor progress |
| Technical Officer | Perform inspections, mapping, evidence collection, analysis, and draft preparation |
| Manager L3 / L2 / L1 | Review, return, approve, and finalize valuation reports in stages |
| Bank | Access eligible completed valuation reports |
| Admin | Create and maintain staff and bank accounts |

## Technology

- React 18
- TypeScript
- Vite 5
- React Router 6
- Tailwind CSS
- Leaflet and React Leaflet

The backend uses NestJS, PostgreSQL, Supabase Storage, Nodemailer, and optional external AI/search services.

## Requirements

- Node.js 18 or later
- npm
- Git
- PostgreSQL or a PostgreSQL-compatible hosted database such as Neon
- Both project repositories checked out on the same machine

## Clone the latest development version

```bash
git clone --branch dev https://github.com/Valuation-System-Project-ZV-x-FIT-G18/Land-Valuation-Backend.git
git clone --branch dev https://github.com/Valuation-System-Project-ZV-x-FIT-G18/Land-Valuation-Frontend.git
```

## Backend setup

Run these commands in the backend repository:

```bash
cd Land-Valuation-Backend
npm install
```

Create `Land-Valuation-Backend/.env`. The minimum configuration is:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/land_valuation
PORT=4000
```

Optional integrations can be configured when their features are required:

```env
# Email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM=CODEHUB Land Valuation <no-reply@example.com>

# Private document and image storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=land-valuation-private

# Optional AI, OCR, and nearby-listing integrations
GEMINI_API_KEY=your-key
OCR_SPACE_API_KEY=your-key
SERPAPI_API_KEY=your-key
```

Never commit or share the real `.env` file. It contains database credentials and secret keys.

Create the database schema and initial administrator once:

```bash
psql "postgresql://user:password@localhost:5432/land_valuation" -f schema.sql
node seed-admin.mjs
```

Start the backend:

```bash
npm run start:dev
```

The API will be available at `http://localhost:4000/api`.

> The initial local administrator created by `seed-admin.mjs` is `Adm001` with password `Test@1234`. Change this password before using the system outside a local demonstration environment.

## Frontend setup

Open a second terminal and run:

```bash
cd Land-Valuation-Frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

During development, Vite proxies all `/api` requests to `http://localhost:4000`, so the frontend does not require its own `.env` file for local use.

## Validation conventions

Shared validation rules are used throughout the frontend and mirrored by the backend DTO validation. Important formats include:

- Phone numbers: a valid Sri Lankan mobile or landline number entered as nine digits after the fixed `+94` prefix
- NIC: 12 digits, or 9 digits followed by `V` or `X`
- Email: a valid email address; email addresses and NIC values must be unique across accounts
- Password: at least 8 characters with uppercase, lowercase, numeric, and symbol characters
- Postal code: 4–5 digits

The backend is the final validation authority. API validation and duplicate-account errors are displayed as user-friendly field messages in the frontend.

## Available commands

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode on port 4000 |
| `npm run build` | Compile the backend into `dist/` |
| `npm run start:prod` | Run the compiled backend |

## Project structure

```text
Land-Valuation-Frontend/
├── public/                 Static assets
├── src/
│   ├── Common_Pages/       Shared UI, authentication, hooks, validation, and utilities
│   ├── Home_Pages/         Public pages, login, dashboard, messages, and settings
│   ├── Role_Pages/         Role-specific screens and API clients
│   ├── App.tsx             Application routes
│   └── main.tsx            React entry point
├── vite.config.ts          Vite configuration and backend proxy
└── package.json            Dependencies and scripts
```

## Troubleshooting

- **`Could not reach the server`** — confirm the backend has finished starting on port 4000. Initial database schema checks can take some time with a hosted database.
- **Database connection errors** — verify `DATABASE_URL`, network access, database availability, and SSL parameters required by the provider.
- **Port 3000 or 4000 already in use** — stop the existing process or change the relevant development port and proxy configuration together.
- **Email is not sent** — account creation can still succeed for best-effort notifications; verify the SMTP values and provider-specific app-password requirements.
- **Uploads fail** — verify all three Supabase variables and ensure the configured private bucket exists.

## Security notes

- Do not commit `.env`, credentials, API keys, uploaded documents, build output, or runtime logs.
- Use a Supabase service-role key only on the backend; never expose it to the browser.
- Replace demonstration credentials before deployment.
- Grant repository access only to intended reviewers when the repositories are private.

## Team — ZV × FIT Group 18

| Area | Contributor |
| --- | --- |
| Coordinator | Radhika Narampanawa |
| Bank and Loan Applicant | Pranidi Methmini |
| Managers L1 / L2 / L3 | Amandi Shanali |
| Technical Officer | Reshani Dilsara |
| Admin, Home, and Setup | Chathu Hewage |
| Common and Shared Code | Pranidi Methmini |

© 2026 ZV × FIT Group 18. Created for academic purposes.

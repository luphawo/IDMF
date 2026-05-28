# Integrated Demand Management (IDM) Platform

A web-based governance workflow platform for centralising institutional demand intake, strategic alignment, portfolio prioritisation, and executive reporting at UNISA.

## Features

- **Initiative Registration** — Register new governance initiatives with strategic alignment, capability mapping, budget, and timeline
- **Governance Workflow** — 7-stage lifecycle: Submitted → Accepted → Reviewed → SolArch → Assessed → Recommended → Approved (+ Parked, Declined, Referred Back)
- **Strategic Classification** — Score initiatives against 5 Strategic Pillars + 5 Enablers using weighted scoring (weights: 17,15,13,11,9,7,7,7,7,7)
- **SteerCo Value & Ease Scoring** — 6 dimensions with custom 3-option dropdowns; Value (2–20) + Ease (5–50) matrix
- **Executive Reporting** — Value vs Ease scatter plot, CSV export, stats dashboard
- **Role-Based Views** — 5 personas (Requester, Owner, Demand Planner, Solutions Architect, ICT SteerCo Secretariat) with context-specific action workstations
- **Initiative Search & Filtering** — Search by name; filter by status via stat cards
- **SharePoint Integration Module** — Document management skeleton with Graph API config

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (HTML5, CSS3, Canvas API) |
| Backend | Node.js / TypeScript |
| Workflow Engine | Custom state machine |
| Data Store | JSON file (auto-seeded) |
| Document Repository | SharePoint Online (module skeleton) |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Install & Run

```bash
# Build TypeScript
cd backend
npm install
npm run build

# Start server (serves backend API + frontend)
npm start
```

The application is served at `http://localhost:3005/`.

### Start (development)

```bash
cd backend
npm run dev
```

### Start (background process)

```powershell
Start-Process -FilePath "node" -ArgumentList "backend/dist/server.js" -WindowStyle Hidden -PassThru
```

## Workflow States

```
Submitted → Accepted → Reviewed → SolArch → Assessed → Recommended → Approved
                                      ↓                      ↓
                                   Parked              Declined / Referred Back
```

| State | Description |
|---|---|
| Submitted | Initiative registered by Requester |
| Accepted | Accepted by Initiative Owner |
| Reviewed | Assigned to Architect for review |
| SolArch | Solutions Architecture assessment in progress |
| Assessed | Architecture assessment completed |
| Recommended | Recommended to ICT SteerCo |
| Approved | Approved by ICT SteerCo Secretariat |
| Parked | Temporarily parked by Demand Planner |
| Declined | Rejected at any stage |
| Referred Back | Sent back for revision |

## Personas (Mock Auth)

The application uses request header-based authentication. Select a persona from the sidebar to switch roles.

| Persona | Header Role |
|---|---|
| Jane Doe (Requester) | Initiative Requester |
| Vusi Executive (Owner) | Initiative Owner |
| Sello Demand (Planner) | Demand Planner |
| Dev Solutions (Architect) | Solutions Architect |
| Naledi SteerCo (Secretariat) | ICT SteerCo Secretariat |

## API Endpoints

All endpoints are mounted under `/api/initiatives`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/initiatives` | List all initiatives |
| GET | `/api/initiatives/:id` | Get initiative details |
| POST | `/api/initiatives/register` | Register new initiative |
| POST | `/api/initiatives/:id/accept` | Accept or Decline (UC2) |
| POST | `/api/initiatives/:id/assign` | Assign reviewer or Park (UC3) |
| POST | `/api/initiatives/:id/review` | Submit review (UC4) |
| POST | `/api/initiatives/:id/strategic-classification` | Save SC scores |
| POST | `/api/initiatives/:id/assess` | Submit SolArch assessment (UC5) |
| POST | `/api/initiatives/:id/recommend` | Record recommendation (UC6) |
| POST | `/api/initiatives/:id/steerco-scoring` | Save SteerCo scores |
| POST | `/api/initiatives/:id/unpark` | Unpark a parked initiative |
| POST | `/api/initiatives/:id/approve` | Approve/Decline/Refer Back (UC7) |
| GET | `/api/health` | Health check |

## Project Structure

```
IDMP/
├── backend/
│   ├── dist/
│   │   ├── routes/           # Compiled route handlers
│   │   ├── services/         # Compiled services (DbService, WebhookService)
│   │   └── server.js         # Compiled server entry
│   ├── src/                  # TypeScript source
│   └── package.json
├── frontend/
│   ├── index.html            # Main HTML (all views)
│   ├── style.css             # Light theme CSS variables
│   └── main.js               # Frontend application logic
├── Integrated_Demand_Management_PRD.md
└── README.md
```

## Configuration

Key constants in `frontend/main.js`:

- `STRATEGIC_FRAMEWORK` — Pillar/enabler weights and names
- `THRESHOLDS` — Classification (<25 Minor, >=25 Medium, >=75 High) and SteerCo bands
- `STEERCO_OPTIONS` — 3-option dropdown maps for each dimension
- `STEERCO_DIMENSIONS` — Dimension labels and descriptions
- `WORKFLOW_STATES` — State machine defining roles, fields, and transitions

## Data Store

The backend auto-creates `backend/dist/data/idmp_store.json` on first start with empty arrays. Delete this file to reset all data (it will be recreated on next startup).

```powershell
Remove-Item backend/dist/data/idmp_store.json -Force
```

## License

UNISA — Internal Use

# Integrated Demand Management (IDM) Platform
## Product Requirements Document (PRD)

**Version:** 1.1  
**Date:** 27 May 2026
**Status Key:** ✅ = Implemented | 🔄 = Planned / Not Started

---

# 1. Executive Summary

This Product Requirements Document (PRD) defines the requirements for an enterprise Integrated Demand Management (IDM) Platform that will centralise institutional demand governance, portfolio prioritisation, strategic alignment, architecture governance, financial oversight, collaboration, and reporting.

The platform will integrate with:

- Microsoft Teams 🔄
- Microsoft Outlook 🔄
- Microsoft SharePoint ✅ (module skeleton)
- Microsoft Entra ID 🔄
- Power BI 🔄
- PMO systems 🔄
- Enterprise Architecture repositories 🔄
- ERP systems 🔄
- ITSM platforms 🔄

---

# 2. Vision Statement

To establish a unified enterprise demand governance platform that enables the university to:

- Prioritise institutional initiatives effectively
- Improve governance transparency
- Reduce duplication
- Align initiatives with institutional strategy
- Improve portfolio visibility
- Enable architecture-led governance
- Improve financial and operational oversight

---

# 3. Business Objectives

The IDM Platform must:

1. Centralise all institutional demand requests ✅
2. Align initiatives with strategic pillars ✅
3. Improve governance visibility ✅
4. Reduce duplicate initiatives 🔄
5. Improve prioritisation ✅ (Strategic Classification + SteerCo Value & Ease)
6. Enable enterprise architecture governance ✅ (basic)
7. Improve financial governance 🔄
8. Improve committee turnaround times 🔄
9. Enable executive reporting ✅
10. Support digital transformation governance 🔄

---

# 4. Scope

## 4.1 In Scope

### Demand Intake
- Initiative registration ✅
- Strategic alignment ✅
- Capability mapping ✅
- Business case submission 🔄
- Supporting document management 🔄

### Governance Workflow
- Acceptance workflows ✅
- Review workflows ✅
- Assessment workflows ✅
- Committee approvals ✅
- Rejection workflows ✅
- Escalation workflows 🔄

### Portfolio Management
- Portfolio prioritisation ✅ (Strategic Classification + SteerCo)
- Demand scoring ✅
- Capacity planning 🔄
- Dependency management 🔄
- Roadmapping 🔄

### Enterprise Architecture
- Solution assessments ✅ (basic)
- Technology governance 🔄
- Integration assessments 🔄
- Security reviews 🔄

### Financial Governance
- Budget estimation ✅
- Cost modelling 🔄
- Funding validation 🔄
- Benefits realisation 🔄

### Reporting & Analytics
- Executive dashboards ✅
- SLA reporting 🔄
- Portfolio reporting ✅
- Governance analytics 🔄

### Collaboration
- Teams collaboration 🔄
- Outlook scheduling 🔄
- SharePoint document management ✅ (module skeleton)

### AI Capabilities
- AI-assisted categorisation 🔄
- Duplicate detection 🔄
- Automated summaries 🔄
- Predictive recommendations 🔄

---

# 5. Stakeholders

| Stakeholder | Responsibility | Status |
|---|---|---|
| Executive Management | Strategic oversight | 🔄 |
| ICT Steering Committee | Governance approvals | ✅ |
| Enterprise Architecture | Architecture governance | ✅ |
| PMO | Portfolio governance | 🔄 |
| Finance Department | Financial validation | 🔄 |
| Risk & Compliance | Risk governance | 🔄 |
| Faculties and Departments | Demand submission | ✅ |
| ICT Operations | Delivery planning | 🔄 |

---

# 6. User Personas

## Initiative Requester ✅
Responsible for submitting institutional demand requests.

## Initiative Owner ✅
Business sponsor responsible for initiative ownership.

## Demand Planner ✅
Coordinates governance workflows and prioritisation.

## Enterprise Architect 🔄
Conducts architecture governance reviews.

## Solutions Architect ✅
Conducts technical assessments.

## Finance Reviewer 🔄
Validates financial feasibility.

## Risk & Compliance Reviewer 🔄
Conducts compliance and risk reviews.

## PMO Analyst 🔄
Coordinates project onboarding and portfolio governance.

---

# 7. Enterprise Demand Lifecycle

| Stage | Description | Status |
|---|---|---|
| Draft | Request preparation | 🔄 |
| Submitted | Official submission | ✅ |
| Screening | Initial validation | 🔄 |
| Accepted | Accepted into workflow | ✅ |
| Discovery | Clarification and analysis | 🔄 |
| Under Review | Governance review | ✅ (as Reviewed) |
| Architecture Assessment | EA review | ✅ (as SolArch) |
| Financial Assessment | Budget review | 🔄 |
| Risk Assessment | Compliance review | 🔄 |
| Prioritisation | Portfolio scoring | ✅ (SC + SteerCo) |
| Recommended | Governance recommendation | ✅ |
| Approved | Approved for execution | ✅ |
| Planned | Scheduled into roadmap | 🔄 |
| Project Initiated | PMO handover | 🔄 |
| In Delivery | Active execution | 🔄 |
| On Hold | Temporarily paused | 🔄 |
| Rejected | Declined | ✅ |
| Parked | Temporarily parked | ✅ |
| Referred Back | Sent back for changes | ✅ |
| Closed | Completed | 🔄 |
| Benefits Tracking | Post implementation review | 🔄 |

---

# 8. Functional Requirements

# 8.1 Demand Intake Management

## FR-001: Initiative Registration ✅

The system shall allow authenticated users to register initiatives with:

- Initiative name ✅
- Background ✅
- Business problem ✅
- Objectives ✅
- Strategic alignment ✅
- Capability alignment ✅
- Budget estimate ✅
- Timeline estimate ✅
- Benefits ✅
- Risks 🔄
- Attachments 🔄

### Validation
- Mandatory field validation ✅
- Duplicate detection 🔄
- Business unit validation 🔄

---

## FR-002: Demand Categorisation 🔄

Supported categories:

- Strategic initiative
- Operational improvement
- Compliance initiative
- Infrastructure initiative
- Innovation initiative
- Emergency initiative
- Service improvement

---

## FR-003: Strategic Alignment ✅

The system shall map initiatives to:

- Strategic pillars ✅
- Institutional KPIs 🔄
- Enterprise capabilities ✅
- Digital transformation themes 🔄

---

# 8.2 Workflow & Governance

## FR-004: Workflow Engine ✅

The platform shall support:

- Sequential approvals ✅
- Parallel approvals 🔄
- Conditional routing 🔄
- Escalations 🔄
- SLA monitoring 🔄
- Delegation 🔄
- Workflow history ✅

---

## FR-005: SLA Management 🔄

The system shall:

- Monitor turnaround times
- Trigger escalations
- Notify stakeholders
- Produce SLA reports

### Example SLAs

| Stage | SLA |
|---|---|
| Screening | 3 business days |
| Acceptance | 5 business days |
| Architecture Assessment | 10 business days |
| Governance Decision | 15 business days |

---

## FR-006: Approval Governance ✅

The platform shall support:

- Individual approvals ✅
- Committee approvals ✅
- Electronic approvals 🔄
- Digital signatures 🔄
- Approval comments ✅
- Audit logging ✅

---

# 8.3 Portfolio Management

## FR-007: Portfolio Prioritisation ✅

The system shall support weighted scoring based on:

- Strategic alignment ✅ (Strategic Classification — 10 pillars/enablers with weights)
- Student impact 🔄
- Regulatory impact 🔄
- Financial value 🔄
- Operational value 🔄
- Risk reduction 🔄
- Architecture alignment 🔄
- Complexity 🔄
- Urgency 🔄
- Value & Ease scoring ✅ (SteerCo — 6 dimensions with 3-option dropdowns)

---

## FR-008: Capacity Planning 🔄

The system shall:

- Track delivery capacity
- Forecast resource demand
- Identify bottlenecks
- Support roadmap planning

---

## FR-009: Dependency Management 🔄

The platform shall support:

- Initiative dependencies
- Shared systems tracking
- Timeline conflicts
- Portfolio impact analysis

---

# 8.4 Enterprise Architecture Governance

## FR-010: Architecture Assessment ✅ (basic)

The platform shall support:

- Solution architecture reviews ✅
- Application impact assessments 🔄
- Integration assessments 🔄
- Security reviews 🔄
- Data architecture reviews 🔄
- Cloud alignment reviews 🔄

---

## FR-011: Capability Mapping ✅

The platform shall map initiatives to:

- Business capabilities ✅
- Applications 🔄
- Data domains 🔄
- Technology domains 🔄

---

# 8.5 Financial Governance

## FR-012: Financial Assessment 🔄

The system shall support:

- Budget estimation ✅
- CAPEX/OPEX classification 🔄
- TCO calculations 🔄
- Cost-benefit analysis 🔄
- Funding approvals 🔄

---

## FR-013: Benefits Realisation 🔄

The platform shall:

- Capture planned benefits
- Track realised benefits
- Compare planned vs actual outcomes

---

# 8.6 Risk & Compliance

## FR-014: Risk Assessments 🔄

The platform shall support:

- Enterprise risk reviews
- Cybersecurity reviews
- POPIA assessments
- Legal reviews
- Business continuity reviews

---

# 8.7 Reporting & Analytics

## FR-015: Executive Dashboards ✅

Dashboards shall include:

- Demand pipeline ✅
- Portfolio health ✅
- Budget utilisation ✅
- SLA compliance 🔄
- Strategic alignment ✅
- Resource utilisation 🔄
- Benefits realisation 🔄

---

## FR-016: Reporting Engine ✅

The system shall support:

- Scheduled reports 🔄
- Ad-hoc reports 🔄
- PDF and Excel exports ✅ (CSV export)
- Power BI integration 🔄
- Scatter plot (Value vs Ease) ✅

---

# 8.8 AI & Automation

## FR-017: AI-Assisted Classification 🔄

The system shall use AI to:

- Suggest categories
- Recommend reviewers
- Detect duplicates
- Generate summaries

---

## FR-018: Intelligent Recommendations 🔄

The system shall recommend:

- Similar initiatives
- Reusable solutions
- Existing systems
- Architecture patterns

---

# 9. Microsoft 365 Integration Requirements

# 9.1 Microsoft Teams Integration 🔄

## Teams Notifications

The platform shall send Teams notifications for:

- New requests
- Assignments
- Approval requests
- Escalations
- SLA breaches
- Committee reminders

---

## Teams Collaboration Workspace

The platform shall automatically provision Teams channels for:

- Strategic initiatives
- Approved projects
- Governance committees

### Features
- File sharing
- Meeting scheduling
- Chat collaboration
- Decision logging

---

## Teams Meetings

The platform shall:

- Schedule governance meetings
- Generate Teams meeting links
- Sync committee calendars

---

## Adaptive Cards

The platform shall support Teams Adaptive Cards for:

- Approvals
- Notifications
- Escalations
- Quick actions

---

# 9.2 Microsoft Outlook Integration 🔄

## Outlook Notifications

The platform shall send Outlook emails for:

- Workflow actions
- Pending approvals
- Escalations
- Committee schedules

---

## Calendar Integration

The platform shall:

- Create governance meetings
- Send invitations
- Synchronise schedules

---

## Outlook Actionable Messages

The platform shall support:

- Inline approvals
- Quick decisions
- Meeting confirmations

---

# 9.3 SharePoint Integration ✅ (module skeleton)

## Document Repository

The platform shall store:

- Business cases ✅
- Assessment reports ✅
- Governance artefacts 🔄
- Meeting packs 🔄
- Contracts 🔄
- Architecture documents 🔄

---

## Document Versioning 🔄

The platform shall support:

- Version history
- Retention policies
- Check-in/check-out
- Audit trails

---

## SharePoint Site Provisioning 🔄

The platform shall automatically provision SharePoint sites for:

- Governance committees
- Portfolios
- Approved initiatives

---

## Metadata Management 🔄

The platform shall apply metadata such as:

- Initiative ID
- Business owner
- Status
- Portfolio
- Strategic pillar

---

# 10. Non-Functional Requirements

# 10.1 Performance

| Requirement | Target | Status |
|---|---|---|
| Page Load Time | <3 seconds | ✅ |
| Workflow Response | <2 seconds | ✅ |
| Availability | 99.9% | 🔄 |
| Concurrent Users | 5,000+ | 🔄 |

---

# 10.2 Security 🔄

The platform shall support:

- SSO
- Microsoft Entra ID integration
- MFA
- RBAC (mock auth headers implemented ✅)
- Encryption at rest
- Encryption in transit
- Audit logging

---

# 10.3 Compliance 🔄

The solution shall comply with:

- POPIA
- ISO 27001
- King IV
- Institutional governance policies

---

# 10.4 Accessibility 🔄

The platform shall comply with:

- WCAG 2.1 AA
- Keyboard navigation
- Screen reader compatibility

---

# 11. Integration Requirements

| System | Purpose | Status |
|---|---|---|
| Microsoft Teams | Collaboration | 🔄 |
| Outlook | Notifications & scheduling | 🔄 |
| SharePoint | Document management | ✅ (module skeleton) |
| Entra ID | Authentication | 🔄 |
| ERP | Budget validation | 🔄 |
| HR System | Organisational hierarchy | 🔄 |
| PMO Tool | Project onboarding | 🔄 |
| ITSM Platform | Service management | 🔄 |
| Power BI | Reporting | 🔄 |

---

# 12. Governance Committees

| Committee | Purpose | Status |
|---|---|---|
| Demand Review Board | Intake governance | 🔄 |
| Architecture Review Board | Architecture governance | 🔄 |
| ICT Steering Committee | Strategic approvals | ✅ (via SteerCo Secretariat) |
| Portfolio Review Board | Portfolio optimisation | 🔄 |
| Risk Committee | Risk governance | 🔄 |
| Finance Committee | Financial approvals | 🔄 |

---

# 13. Reporting Requirements

## Operational Reports
- Submitted demands ✅
- Pending approvals ✅
- SLA breaches 🔄

## Portfolio Reports
- Prioritised initiatives ✅
- Capacity utilisation 🔄
- Budget consumption ✅

## Governance Reports
- Committee decisions ✅
- Approval trends 🔄
- Risk exposure 🔄

## Executive Reports
- Portfolio value ✅
- Benefits realisation 🔄
- Strategic delivery metrics ✅

---

# 14. Technology Architecture

| Layer | Technology | Status |
|---|---|---|
| Frontend | Vanilla JS (HTML5 + CSS3 + Canvas API) | ✅ |
| Backend | Node.js / TypeScript | ✅ |
| Workflow Engine | Custom state machine (built-in) | ✅ |
| Database | JSON file store (auto-seeded) | ✅ |
| Document Repository | SharePoint Online (module skeleton) | ✅ |
| Reporting | Canvas scatter plot, CSV export | ✅ |
| Hosting | Microsoft Azure | 🔄 |
| AI Services | Azure OpenAI | 🔄 |

> **Note:** The frontend uses vanilla JavaScript (no framework) for the prototype. A migration to React/Next.js is planned.

---

# 15. Security Architecture

The solution shall support:

- Role-based access control ✅ (mock auth via request headers)
- Privileged access management 🔄
- SIEM integration 🔄
- Threat monitoring 🔄
- Secure APIs 🔄
- Zero-trust architecture 🔄

---

# 16. Phased Implementation Roadmap

# Phase 1 — Core Workflow ✅ (Complete)

- Demand intake ✅
- Workflow engine ✅
- Notifications 🔄 (planned)
- SharePoint integration ✅ (module skeleton)
- Reporting dashboards ✅

# Phase 2 — Governance 🔄 (In Progress)

- Architecture governance
- Financial governance
- Risk management
- Outlook integration

# Phase 3 — Portfolio Management 🔄

- Prioritisation
- Capacity planning
- Dependency management
- Road-mapping

# Phase 4 — AI & Automation 🔄

- AI recommendations
- Predictive analytics
- Intelligent automation

---

# 17. Success Metrics

| Metric | Target | Status |
|---|---|---|
| Approval Cycle Reduction | 40% | 🔄 |
| SLA Compliance | 95% | 🔄 |
| Duplicate Reduction | 60% | 🔄 |
| Workflow Automation | >80% | ✅ (core workflow automated) |
| User Adoption | >85% | 🔄 |

---

# 18. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Low adoption | Change management |
| Governance resistance | Executive sponsorship |
| Integration complexity | API-first architecture |
| Scope creep | Phased implementation |

---

# 19. Change Management

The implementation shall include:

- Stakeholder engagement ✅ (requirements gathered)
- User training 🔄
- Governance workshops 🔄
- Adoption monitoring 🔄
- Knowledge management 🔄

---

# 20. Conclusion

The Integrated Demand Management Platform will provide the university with a centralised enterprise governance and portfolio management capability integrating governance, architecture, finance, collaboration, analytics, and strategic planning into a unified institutional platform.

By integrating Microsoft Teams, Outlook, and SharePoint into the operating model, the university will embed governance directly into institutional collaboration workflows while enabling improved visibility, prioritisation, and delivery governance across the institution.

---

# 21. Implementation Status Summary

| Feature | Status | Details |
|---|---|---|
| Initiative Registration | ✅ | Mandatory fields, strategy/capability alignment, budget/time |
| Strategic Classification | ✅ | 10 pillars/enablers with weights (17,15,13,11,9,7,7,7,7,7) |
| SteerCo Value & Ease Scoring | ✅ | 6 dimensions, 3-option dropdowns, Value range 2-20, Ease range 5-50 |
| Workflow States (9) | ✅ | Submitted → Accepted → Reviewed → SolArch → Assessed → Recommended → Approved + Parked/Declined/Referred Back |
| User Personas (5) | ✅ | Requester, Owner, Demand Planner, Solutions Architect, SteerCo Secretariat |
| Executive Reports | ✅ | Value vs Ease scatter plot, CSV export, stats cards |
| Initiative Search | ✅ | Real-time filter by name in Initiatives Registry |
| Stat Card Filters | ✅ | Click stat card to filter list by status |
| SharePoint Module | ✅ | Skeleton with Graph API config, polling, document type routing |
| Light Theme | ✅ | CSS custom properties, glassmorphism design |
| Toast Notifications | ✅ | Custom modal overlay replacing native alert() |
| RBAC (mock) | ✅ | Role/email/name/unit via x-* headers |
| Teams Integration | 🔄 | Not started |
| Outlook Integration | 🔄 | Not started |
| Entra ID / SSO | 🔄 | Not started |
| Power BI Integration | 🔄 | Not started |
| AI Capabilities | 🔄 | Not started |
| SLA Management | 🔄 | Not started |
| Full Financial Governance | 🔄 | Not started |
| Risk & Compliance | 🔄 | Not started |
| WCAG Accessibility | 🔄 | Not started |

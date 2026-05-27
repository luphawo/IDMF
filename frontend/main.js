// ============================================================
// IDMF - Integrated Demand Management Framework
// Version: 2.0.0 (Security Hardened & Refactored)
// ============================================================

const API_BASE = window.IDM_CONFIG?.API_BASE || 'http://localhost:3005/api';

// ============================================================
// CONFIGURATION & CONSTANTS (Single Source of Truth)
// ============================================================

const STRATEGIC_FRAMEWORK = {
    pillars: [
        { name: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching", weight: 17 },
        { name: "Pillar 2: Propel Research Innovation", weight: 15 },
        { name: "Pillar 3: Pivot Engaged Scholarship and Global Impact", weight: 13 },
        { name: "Pillar 4: Strengthen Student Support Services", weight: 11 },
        { name: "Pillar 5: Resourcing our Futures", weight: 9 },
        { name: "Enabler 1: People", weight: 7 },
        { name: "Enabler 2: Digitalization and Digitization", weight: 7 },
        { name: "Enabler 3: Governance, Reporting and Management Systems", weight: 7 },
        { name: "Enabler 4: Financial Sustainability", weight: 7 },
        { name: "Enabler 5: Infrastructure and Operations", weight: 7 }
    ]
};

const THRESHOLDS = {
    strategicClassification: {
        minor: { max: 25 },
        medium: { min: 25, max: 75 },
        high: { min: 75 }
    },
    steercoValue: {
        high: { min: 15 },
        medium: { min: 10, max: 15 },
        low: { max: 10 }
    },
    steercoEase: {
        high: { min: 30 },
        medium: { min: 20, max: 30 },
        low: { max: 20 }
    }
};

const WORKFLOW_STATES = {
    Parked: {
        allowedRoles: ['Demand Planner'],
        render: (init, persona) => ({
            message: `This initiative is <strong>Parked</strong>. You can unpark it to return to Accepted state.`,
            fields: [
                { type: 'textarea', id: 'unparkComments', label: 'Unpark Comments', placeholder: 'Reason for unparking...' }
            ],
            actions: [
                { label: 'Unpark Initiative', action: 'unpark', arg: null, style: 'success' }
            ]
        })
    },
    Submitted: {
        allowedRoles: ['Initiative Owner'],
        condition: (init, persona) => init.owner_email === persona.email,
        render: () => ({
            fields: [
                { type: 'textarea', id: 'ownerComments', label: 'Acceptance Comments / Remarks', placeholder: 'Enter comments here...' }
            ],
            actions: [
                { label: 'Accept Request', action: 'accept', arg: 'Accept', style: 'success', confirm: false },
                { label: 'Decline', action: 'accept', arg: 'Decline', style: 'danger', confirm: true }
            ]
        })
    },
    Accepted: {
        allowedRoles: ['Demand Planner'],
        render: () => ({
            fields: [
                { type: 'select', id: 'assignReviewer', label: 'Assign Governance Reviewer *', options: [
                    { value: 'dev.arch@unisa.ac.za|Dev Solutions', label: 'Dev Solutions (Enterprise Architecture)' },
                    { value: 'jane.doe@unisa.ac.za|Jane Doe', label: 'Jane Doe (Academic Affairs)' }
                ]}
            ],
            actions: [
                { label: 'Assign & Set Reviewed', action: 'assign', arg: 'Assign', style: 'primary', confirm: false },
                { label: 'Park Initiative', action: 'assign', arg: 'Park', style: 'warning', confirm: true }
            ]
        })
    },
    Reviewed: {
        allowedRoles: ['Solutions Architect', 'Demand Planner'],
        render: (init) => {
            const sc = init.strategic_classification;
            const derivedImpact = !sc ? 'Not yet classified' :
                sc.total_weighted_score < THRESHOLDS.strategicClassification.minor.max ? 'Minor' :
                sc.total_weighted_score >= THRESHOLDS.strategicClassification.high.min ? 'High' : 'Medium';
            return {
                fields: [
                    { type: 'text', id: 'reviewImpact', label: 'Derived Strategic Impact (from Classification)', value: derivedImpact, readonly: true },
                    { type: 'select', id: 'reviewBcStatus', label: 'Business Case Document Status *', options: [
                        { value: 'In-Progress', label: 'In-Progress (Draft)' },
                        { value: 'Signed-Fully', label: 'Signed-Fully (Uploaded to SharePoint)' }
                    ]}
                ],
                actions: [
                    { label: 'Submit Review', action: 'review', arg: null, style: 'primary', confirm: false }
                ]
            };
        }
    },
    SolArch: {
        allowedRoles: ['Solutions Architect'],
        render: () => ({
            fields: [
                { type: 'select', id: 'assessReportStatus', label: 'SolArch Assessment Report Status *', options: [
                    { value: 'In-Progress', label: 'In-Progress' },
                    { value: 'Completed', label: 'Completed (Uploaded to SharePoint)' }
                ]}
            ],
            actions: [
                { label: 'Submit Assessment', action: 'assess', arg: null, style: 'primary', confirm: false }
            ]
        })
    },
    Assessed: {
        allowedRoles: ['ICT SteerCo Secretariat', 'Solutions Architect'],
        render: () => ({
            fields: [
                { type: 'select', id: 'recommendDecision', label: 'Committee Meeting Recommendation *', options: [
                    { value: 'Recommended', label: 'Recommended (To ICT SteerCo)' },
                    { value: 'Declined', label: 'Declined', confirm: true },
                    { value: 'Referred Back', label: 'Referred Back to Owner' }
                ]}
            ],
            actions: [
                { label: 'Record Recommendation', action: 'recommend', arg: null, style: 'primary', confirm: false }
            ]
        })
    },
    Recommended: {
        allowedRoles: ['ICT SteerCo Secretariat'],
        render: (init) => {
            let valueBadge = '', easeBadge = '';
            if (init.steerco_scoring) {
                const v = init.steerco_scoring.value;
                const e = init.steerco_scoring.ease;
                const vColor = v >= THRESHOLDS.steercoValue.high.min ? 'var(--success)' : 
                               v >= THRESHOLDS.steercoValue.medium.min ? 'var(--warning)' : 'var(--danger)';
                const eColor = e >= THRESHOLDS.steercoEase.high.min ? 'var(--success)' : 
                               e >= THRESHOLDS.steercoEase.medium.min ? 'var(--warning)' : 'var(--danger)';
                valueBadge = `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${vColor}20;color:${vColor};font-weight:600;font-size:0.85rem;">Value: ${formatNumber(v)}</span>`;
                easeBadge = `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${eColor}20;color:${eColor};font-weight:600;font-size:0.85rem;">Ease: ${formatNumber(e)}</span>`;
            } else {
                valueBadge = `<span style="color:var(--text-secondary);font-size:0.85rem;">Value: Not scored yet</span>`;
                easeBadge = `<span style="color:var(--text-secondary);font-size:0.85rem;">Ease: Not scored yet</span>`;
            }
            return {
                badges: [valueBadge, easeBadge],
                fields: [
                    { type: 'select', id: 'steercoDecision', label: 'SteerCo Final Decision *', options: [
                        { value: 'Approved', label: 'Approved as Project' },
                        { value: 'Declined', label: 'Declined', confirm: true },
                        { value: 'Referred Back', label: 'Referred Back to Owner' }
                    ]},
                    { type: 'textarea', id: 'approveComments', label: 'Approval Comments', placeholder: 'Enter any remarks...' }
                ],
                actions: [
                    { label: 'Submit Decision', action: 'approve', arg: null, style: 'primary', confirm: false }
                ]
            };
        }
    }
};

const CAPABILITY_DATA = {
    "Learning & Teaching": {
        "Curriculum Management": ["Curriculum Planning", "Curriculum Design", "Curriculum Production", "Curriculum Accreditation", "Offering Management", "Curriculum Improvement", "Curriculum Disestablishment"],
        "Student Recruitment": ["Domestic Student Recruitment", "International Student Recruitment"],
        "Student Admission": ["Study Application Management", "Learning Recognition Management", "Matriculation"],
        "Student Enrolment": ["Enrolment", "Student Allocation", "Timetable Management"],
        "Curriculum Delivery": ["Learning & Teaching Resource Preparation", "Learning & Teaching Resource Management", "Learning & Teaching Delivery", "Student Supervision"],
        "Student Assessment": ["Learning Assessment", "Student Research Assessment"],
        "Completion Management": ["Completion Award"],
        "Student Management": ["Scholarship Management", "Student Liability Management", "Financial Aid Management", "Student Academic Progress Management", "Cross-Institutional Study", "Placement Management", "Examination Management", "Special Consideration Management", "Research Candidature Management", "Student Misconduct Management"],
        "Student Support": ["Academic Advice", "Core Skills Development", "Careers Advice", "Financial Advice", "Student Grievance Management"]
    },
    "Research": {
        "Research Opportunities & Planning": ["Research Opportunity Management", "Collaborative Opportunity Management", "Research Project Design"],
        "Research Funding": ["Research Fund Sourcing", "Research Grant Management"],
        "Research Assurance": ["Research Ethics Management", "Research Integrity Management", "Research Performance Management", "Research Quality Management"],
        "Research Management": ["Research Funds Management", "Research Programme Management"],
        "Research Activity": ["Research Data Management", "Research Creation", "Research Infrastructure Management", "Research Resource Management"],
        "Research Dissemination": ["Research Output Management", "Research Outcome Management", "Research Impact Management", "Research Commercialisation Management"]
    },
    "Enabling": {
        "Strategy Management": ["Vision & Strategy Development", "Strategic Plan Management"],
        "Business Capability Management": ["Business Planning", "Enterprise Architecture", "Customer Experience Management", "Business Process Management", "Service Management", "Change Management", "Portfolio & Programme Management", "Project Management", "Product Management", "Benefits Management"],
        "Governance, Risk, & Compliance": ["Policy Management", "Quality Management", "Risk Management", "Compliance Management", "Business Continuity Management", "Incident Management", "Investigation Management", "Internal Audit", "Complaint & Compliment Management"],
        "Library Management": ["Library Collection Management", "Collection Access Management"],
        "Advancement Management": ["Alumni Management", "Fundraising"],
        "Marketing Management": ["Market Research", "Brand Management", "Campaign Management", "Advertising Management", "Merchandising"],
        "Engagement & Relationship Management": ["Communications Management", "Engagement Management", "Relationship Management", "Outreach Management", "Extension Management"],
        "Legal Affairs": ["Legal Advisory", "Contract Management", "Dispute Resolution", "Litigation Management"],
        "Information & Communication Technology": ["Alignment, Planning, & Organisation", "Build, Acquisition, & Implementation", "Delivery, Service, & Support", "Monitoring, Assessment, & Evaluation"],
        "Human Resource Management": ["Organisational Design", "Workforce Planning", "Talent Acquisition", "Workforce Training & Development", "Remuneration & Benefits Management", "Workforce Resource Management", "Workforce Performance Management", "Workforce Relations Management", "Human Resource Support"],
        "Financial Management": ["Financial Planning & Analysis", "Accounts Payable", "Accounts Receivable", "General Accounting", "Price Modelling", "Tax Management", "Payroll Management", "Bank Management", "Procurement", "Project Accounting", "Asset Management", "Investment Management", "Treasury Management"],
        "Information Management": ["Business Intelligence & Reporting", "Advanced Analytics", "Information Governance", "Information Security Management", "Identity & Access Management", "Data Management", "Enterprise Content Management", "Records Management", "Archive Management", "Digital Preservation", "Artefact & Collection Management", "Intellectual Property Management"],
        "Facilities & Estate Management": ["Facilities Management", "Property Management", "Campus Security Management", "Commercial Tenancy Management", "Cleaning & Waste Management", "Groundskeeping Management", "Environmental Sustainability Management", "Space Utilisation Management"],
        "Auxiliary Capabilities": ["Housing & Accommodation Management", "Gallery & Museum Management", "Childcare Management", "Healthcare Management", "Health, Safety, & Wellbeing Management", "Membership Management", "Sport & Recreation Management", "Intercollegiate Athletics Management", "Retail Management", "Travel Management", "Event Management", "Venue Management", "Publishing Management", "Campus Transportation Management", "Delivery & Distribution"]
    }
};

// ============================================================
// STATE MANAGEMENT (Centralized Store)
// ============================================================

const Store = {
    _state: {
        persona: {
            key: 'requester',
            name: 'Jane Doe',
            email: 'jane.doe@unisa.ac.za',
            unit: 'Academic Affairs',
            role: 'Initiative Requester'
        },
        initiatives: [],
        selectedId: null,
        pendingScores: new Map(),
        pendingSteercoScores: new Map(),
        lastRequestId: 0
    },
    _listeners: new Map(),

    get(key) { return this._state[key]; },

    set(key, value) {
        const oldValue = this._state[key];
        this._state[key] = value;
        this._notify(key, value, oldValue);
    },

    update(key, updater) {
        const current = this._state[key];
        const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
        this.set(key, updated);
    },

    subscribe(key, callback) {
        if (!this._listeners.has(key)) this._listeners.set(key, new Set());
        this._listeners.get(key).add(callback);
        return () => this._listeners.get(key).delete(callback);
    },

    _notify(key, newValue, oldValue) {
        this._listeners.get(key)?.forEach(cb => {
            try { cb(newValue, oldValue); } catch (e) { console.error('Store listener error:', e); }
        });
    }
};

// ============================================================
// SECURITY UTILITIES
// ============================================================

/**
 * Escape HTML entities to prevent XSS attacks.
 * @param {string} str - Raw user input
 * @returns {string} Escaped string safe for HTML insertion
 */
function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

/**
 * Validate and sanitize form inputs.
 */
const Validators = {
    required(value, fieldName) {
        if (!value || String(value).trim() === '') {
            throw new ValidationError(`${fieldName} is required.`);
        }
        return String(value).trim();
    },

    email(value, fieldName = 'Email') {
        const trimmed = this.required(value, fieldName);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            throw new ValidationError(`${fieldName} must be a valid email address.`);
        }
        return trimmed;
    },

    positiveNumber(value, fieldName = 'Amount') {
        const num = Number(value);
        if (isNaN(num) || num < 0) {
            throw new ValidationError(`${fieldName} must be a positive number.`);
        }
        if (num > 999999999999) {
            throw new ValidationError(`${fieldName} exceeds maximum allowed value.`);
        }
        return num;
    },

    maxLength(value, max, fieldName = 'Field') {
        const str = String(value);
        if (str.length > max) {
            throw new ValidationError(`${fieldName} must not exceed ${max} characters.`);
        }
        return str;
    }
};

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

function formatCurrency(amount) {
    if (amount == null) return 'R 0,00';
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleDateString('en-ZA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
}

function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('en-ZA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid Date';
    }
}

function formatNumber(num) {
    if (num == null) return '0.0';
    return Number(num).toFixed(1);
}

// ============================================================
// PURE BUSINESS LOGIC (Testable, No DOM)
// ============================================================

/**
 * Calculate strategic classification from scores.
 * @param {Object} scores - Map of pillar names to scores
 * @returns {Object} Classification result
 */
function calculateStrategicClassification(scores) {
    let total = 0;
    const breakdown = STRATEGIC_FRAMEWORK.pillars.map(p => {
        const score = scores[p.name] || 0;
        const weighted = score * p.weight / 10;
        total += weighted;
        return { name: p.name, weight: p.weight, score, weighted };
    });

    const category = total < THRESHOLDS.strategicClassification.minor.max ? 'Minor' :
                     total >= THRESHOLDS.strategicClassification.high.min ? 'High' : 'Medium';

    return { total, category, breakdown };
}

/**
 * Calculate SteerCo Value score.
 */
function calculateSteercoValue(scNumeric, ictDemand) {
    return scNumeric + (ictDemand || 5);
}

/**
 * Calculate SteerCo Ease score.
 */
function calculateSteercoEase(dimensions) {
    const keys = ['effort', 'system_readiness', 'cost', 'likelihood_success', 'resources'];
    return keys.reduce((sum, k) => sum + (dimensions?.[k] || 0), 0);
}

/**
 * Derive strategic impact from classification score.
 */
function deriveStrategicImpact(classification) {
    if (!classification) return 'Not yet classified';
    const score = classification.total_weighted_score;
    if (score < THRESHOLDS.strategicClassification.minor.max) return 'Minor';
    if (score >= THRESHOLDS.strategicClassification.high.min) return 'High';
    return 'Medium';
}

/**
 * Determine available actions for a role.
 */
function getActionsForRole(initiatives, persona) {
    return initiatives.filter(init => {
        if (init.status === 'Declined' || init.status === 'Approved') return false;

        switch (persona.role) {
            case 'Initiative Owner':
                return init.status === 'Submitted' && init.owner_email === persona.email;
            case 'Demand Planner':
                return init.status === 'Accepted' || init.status === 'Parked';
            case 'Solutions Architect':
                return init.status === 'Reviewed' || init.status === 'SolArch';
            case 'Solutions Architecture Secretariat':
            case 'ICT SteerCo Secretariat':
                return init.status === 'Assessed' || init.status === 'Recommended';
            default:
                return false;
        }
    });
}

// ============================================================
// UI UTILITIES
// ============================================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-overlay');
    if (existing) existing.remove();

    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };

    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
        <div class="toast-box">
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <p>${escapeHtml(message)}</p>
            <button class="toast-btn" onclick="this.closest('.toast-overlay').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const timeout = setTimeout(() => overlay.remove(), 5000);
    overlay.addEventListener('click', (e) => { 
        if (e.target === overlay) {
            clearTimeout(timeout);
            overlay.remove(); 
        }
    });

    const btn = overlay.querySelector('.toast-btn');
    if (btn) btn.focus();
}

function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.confirm-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon">⚠️</div>
                <p>${escapeHtml(message)}</p>
                <div class="confirm-actions">
                    <button class="action-btn" style="background:rgba(255,255,255,0.05);color:var(--text-primary);" onclick="this.closest('.confirm-overlay').remove(); window._confirmResult = false;">Cancel</button>
                    <button class="action-btn" style="background:var(--danger);" onclick="this.closest('.confirm-overlay').remove(); window._confirmResult = true;">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const checkInterval = setInterval(() => {
            if (window._confirmResult !== undefined) {
                clearInterval(checkInterval);
                const result = window._confirmResult;
                delete window._confirmResult;
                resolve(result);
            }
        }, 100);
    });
}

function setLoading(isLoading) {
    document.body.classList.toggle('loading', isLoading);
}

function debounce(fn, ms) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), ms);
    };
}

// ============================================================
// AUTHENTICATION (JWT-Based)
// ============================================================

function getAuthHeaders() {
    const token = sessionStorage.getItem('idm_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const persona = Store.get('persona');
    headers['x-role'] = persona.role;
    headers['x-email'] = persona.email;
    headers['x-name'] = persona.name;
    headers['x-unit'] = persona.unit;
    return headers;
}

// ============================================================
// CASCADING CAPABILITY DROPDOWNS
// ============================================================

function populateCapTypes() {
    const typeSelect = document.getElementById('formCapType');
    if (!typeSelect) return;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(new Option('-- Select Capability Type --', ''));
    Object.keys(CAPABILITY_DATA).forEach(type => {
        fragment.appendChild(new Option(type, type));
    });
    typeSelect.innerHTML = '';
    typeSelect.appendChild(fragment);
}

function populateCapGroups() {
    const type = document.getElementById('formCapType')?.value;
    const groupSelect = document.getElementById('formCapGroup');
    if (!groupSelect) return;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(new Option('-- Select Group --', ''));

    if (type && CAPABILITY_DATA[type]) {
        Object.keys(CAPABILITY_DATA[type]).forEach(group => {
            fragment.appendChild(new Option(group, group));
        });
    }
    groupSelect.innerHTML = '';
    groupSelect.appendChild(fragment);
    populateCapTitles();
}

function populateCapTitles() {
    const type = document.getElementById('formCapType')?.value;
    const group = document.getElementById('formCapGroup')?.value;
    const titleSelect = document.getElementById('formCapTitle');
    if (!titleSelect) return;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(new Option('-- Select Title --', ''));

    if (type && group && CAPABILITY_DATA[type]?.[group]) {
        CAPABILITY_DATA[type][group].forEach(title => {
            fragment.appendChild(new Option(title, title));
        });
    }
    titleSelect.innerHTML = '';
    titleSelect.appendChild(fragment);
}

// ============================================================
// VIEW MANAGEMENT
// ============================================================

const VIEW_MAP = {
    'overview': 0,
    'initiatives-list': 1,
    'intake-form': 2,
    'strategic-classification': 3,
    'steerco-scoring': 4,
    'reporting': 5
};

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');

    const navIndex = VIEW_MAP[viewId];
    if (navIndex !== undefined) {
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems[navIndex]) navItems[navIndex].classList.add('active');
    }

    const routeHandlers = {
        'reporting': renderReports,
        'strategic-classification': renderStrategicClassificationList,
        'steerco-scoring': renderSteercoScoringList
    };

    if (routeHandlers[viewId]) {
        routeHandlers[viewId]();
    }
}

// ============================================================
// PERSONA MANAGEMENT
// ============================================================

function changePersona() {
    const select = document.getElementById('personaSelect');
    if (!select) return;

    const option = select.options[select.selectedIndex];
    const persona = {
        key: select.value,
        name: option.getAttribute('data-name'),
        email: option.getAttribute('data-email'),
        unit: option.getAttribute('data-unit'),
        role: option.getAttribute('data-role')
    };

    Store.set('persona', persona);
    console.log("SSO Persona switched to:", persona);

    const subtitle = document.getElementById('headerSubtitle');
    if (subtitle) {
        subtitle.innerText = `Logged in as: ${escapeHtml(persona.name)} (${escapeHtml(persona.role)}) | Unit: ${escapeHtml(persona.unit)}`;
    }

    loadAllInitiatives();
    const selectedId = Store.get('selectedId');
    if (selectedId) {
        viewInitiativeDetail(selectedId);
    }
}

// ============================================================
// API COMMUNICATION
// ============================================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`API request failed: ${url}`, error);
        throw error;
    }
}

// ============================================================
// INITIATIVE DATA MANAGEMENT
// ============================================================

async function loadAllInitiatives() {
    setLoading(true);
    try {
        const resData = await apiRequest('/initiatives');
        if (resData.success) {
            Store.set('initiatives', resData.data);
        }
    } catch (e) {
        console.warn("Backend API server is offline. Running with fallback local storage state simulation.");
        const initiatives = Store.get('initiatives');
        if (initiatives.length === 0) {
            Store.set('initiatives', [createMockInitiative()]);
        }
    } finally {
        setLoading(false);
    }

    renderOverviewStats();
    renderInboxLists();
}

function createMockInitiative() {
    return {
        id: "init-1",
        request_number: "IDM-2026-0001",
        name: "NextGen Digital Learning Portal Transformation",
        request_date: new Date().toISOString(),
        requester_email: "jane.doe@unisa.ac.za",
        requester_name: "Jane Doe",
        requester_unit: "Academic Affairs",
        owner_email: "vusi.executive@unisa.ac.za",
        owner_name: "Vusi Executive",
        owner_unit: "Deputy Registrar Portfolio",
        background: "The existing academic LMS and registration systems are slow, frustrating students and leading to high dropouts.",
        objective: "Deploy a modern single-page Next.js portal integrating course schedules.",
        potential_benefits: "40% reduction in enrollment support times.",
        alignment_strategy: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching",
        capability_type: "Learning & Teaching",
        capability_group: "Student Admission",
        capability_title: "Study Application Management",
        impact_description: "System replaces legacy student systems.",
        budget_estimate: 850000.00,
        affected_parties: "All academic departments.",
        time_estimate: "12 Months",
        status: "Submitted",
        business_case_status: "In-Progress",
        solarch_report_status: "In-Progress"
    };
}

function renderOverviewStats() {
    const initiatives = Store.get('initiatives');

    const statTotal = document.getElementById('statTotal');
    const statApproved = document.getElementById('statApproved');
    const statDeclined = document.getElementById('statDeclined');
    const statPending = document.getElementById('statPending');

    if (statTotal) statTotal.innerText = initiatives.length;

    const approved = initiatives.filter(i => i.status === 'Approved').length;
    const declined = initiatives.filter(i => i.status === 'Declined' || i.status === 'Parked').length;

    if (statApproved) statApproved.innerText = approved;
    if (statDeclined) statDeclined.innerText = declined;

    const pendingActions = getActionsForRole(initiatives, Store.get('persona')).length;
    if (statPending) statPending.innerText = pendingActions;
}

// ============================================================
// INBOX & LIST RENDERING
// ============================================================

function renderInboxLists() {
    const inbox = document.getElementById('actionInboxList');
    const registry = document.getElementById('fullInitiativesList');
    const initiatives = Store.get('initiatives');
    const persona = Store.get('persona');

    if (inbox) {
        const actions = getActionsForRole(initiatives, persona);
        if (actions.length === 0) {
            inbox.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); border: 1px dashed var(--border); border-radius: 12px;" role="status">
                    All caught up! No active initiatives require action under your "${escapeHtml(persona.role)}" role.
                </div>`;
        } else {
            inbox.innerHTML = '';
            const fragment = document.createDocumentFragment();
            actions.forEach(init => {
                fragment.appendChild(createInitiativeCard(init));
            });
            inbox.appendChild(fragment);
        }
    }

    if (registry) {
        registry.innerHTML = '';
        const fragment = document.createDocumentFragment();
        initiatives.forEach(init => {
            fragment.appendChild(createInitiativeCard(init));
        });
        registry.appendChild(fragment);
    }
}

function createInitiativeCard(init) {
    const div = document.createElement('div');
    div.className = 'initiative-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `View details for ${init.name}`);

    div.addEventListener('click', () => viewInitiativeDetail(init.id));
    div.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            viewInitiativeDetail(init.id);
        }
    });

    div.innerHTML = `
        <div class="item-left">
            <span class="badge ${escapeHtml(init.status)}">${escapeHtml(init.status)}</span>
            <span class="item-title" style="margin-top: 6px;">${escapeHtml(init.name)}</span>
            <div class="item-meta">
                <span>Requester: ${escapeHtml(init.requester_name)}</span>
                <span>Unit: ${escapeHtml(init.requester_unit)}</span>
                <span>Budget: ${formatCurrency(init.budget_estimate)}</span>
            </div>
        </div>
        <div aria-hidden="true">
            <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </div>
    `;
    return div;
}

// ============================================================
// INTAKE FORM SUBMISSION
// ============================================================

async function submitIntakeForm(event) {
    event.preventDefault();

    try {
        const name = Validators.required(document.getElementById('formName').value, 'Initiative Name');
        const owner_name = Validators.required(document.getElementById('formOwnerName').value, 'Owner Name');
        const owner_email = Validators.email(document.getElementById('formOwnerEmail').value, 'Owner Email');
        const background = Validators.maxLength(
            Validators.required(document.getElementById('formBackground').value, 'Background'),
            5000, 'Background'
        );
        const objective = Validators.maxLength(
            Validators.required(document.getElementById('formObjective').value, 'Objective'),
            5000, 'Objective'
        );
        const potential_benefits = Validators.maxLength(
            Validators.required(document.getElementById('formBenefits').value, 'Benefits'),
            5000, 'Benefits'
        );
        const alignment_strategy = Validators.required(document.getElementById('formStrategy').value, 'Strategic Alignment');
        const capability_type = Validators.required(document.getElementById('formCapType').value, 'Capability Type');
        const capability_group = Validators.required(document.getElementById('formCapGroup').value, 'Capability Group');
        const capability_title = Validators.required(document.getElementById('formCapTitle').value, 'Capability Title');
        const impact_description = Validators.maxLength(
            Validators.required(document.getElementById('formImpact').value, 'Impact Analysis'),
            5000, 'Impact Analysis'
        );
        const budget_estimate = Validators.positiveNumber(document.getElementById('formBudget').value, 'Budget Estimate');
        const time_estimate = Validators.required(document.getElementById('formTime').value, 'Time Estimate');
        const affected_parties = Validators.required(document.getElementById('formAffected').value, 'Affected Parties');

        const persona = Store.get('persona');
        const payload = {
            name, owner_name, owner_email, background, objective, potential_benefits,
            alignment_strategy, capability_type, capability_group, capability_title,
            impact_description, budget_estimate, time_estimate, affected_parties
        };

        setLoading(true);
        try {
            const resData = await apiRequest('/initiatives/register', {
                method: 'POST',
                body: payload
            });
            showToast(resData.message, resData.success ? 'success' : 'warning');

            if (resData.success) {
                document.getElementById('intakeForm').reset();
                await loadAllInitiatives();
                switchView('overview');
            }
        } catch (e) {
            const request_number = `IDM-2026-${String(Store.get('initiatives').length + 1).padStart(4, '0')}`;
            const newInit = {
                id: 'init-' + Math.random().toString(36).substr(2, 9),
                request_number,
                name,
                request_date: new Date().toISOString(),
                requester_email: persona.email,
                requester_name: persona.name,
                requester_unit: persona.unit,
                owner_email,
                owner_name,
                owner_unit: 'Corporate Services',
                background, objective, potential_benefits, alignment_strategy,
                capability_type, capability_group, capability_title,
                impact_description, budget_estimate, time_estimate, affected_parties,
                status: 'Submitted',
                business_case_status: 'In-Progress',
                solarch_report_status: 'In-Progress'
            };

            const initiatives = Store.get('initiatives');
            initiatives.push(newInit);
            Store.set('initiatives', initiatives);

            renderOverviewStats();
            renderInboxLists();
            showToast(`Offline Simulation: Registered Initiative with Number: ${request_number}`, 'warning');
            document.getElementById('intakeForm').reset();
            switchView('overview');
        }
    } catch (validationError) {
        if (validationError instanceof ValidationError) {
            showToast(validationError.message, 'error');
        } else {
            console.error('Form submission error:', validationError);
            showToast('An unexpected error occurred. Please try again.', 'error');
        }
    } finally {
        setLoading(false);
    }
}

// ============================================================
// INITIATIVE DETAIL VIEW
// ============================================================

async function viewInitiativeDetail(id) {
    const requestId = ++Store._state.lastRequestId;
    Store.set('selectedId', id);

    let initiative = Store.get('initiatives').find(i => i.id === id);
    if (!initiative) return;

    let history = [];
    try {
        const resData = await apiRequest(`/initiatives/${id}`);
        if (resData.success) {
            initiative = resData.data;
            history = resData.history || [];
        }
    } catch(e) {
        history = [{
            to_status: initiative.status,
            updated_by_name: initiative.requester_name,
            updated_at: initiative.request_date,
            comments: "Registered and submitted to Nominated Executive Owner."
        }];
    }

    if (requestId !== Store._state.lastRequestId) return;

    switchView('initiative-detail');
    renderDetailContent(initiative, history);
    renderActionWorkstation(initiative);
}

function renderDetailContent(initiative, history) {
    const elements = {
        title: document.getElementById('detailTitle'),
        meta: document.getElementById('detailMeta'),
        badge: document.getElementById('detailBadge'),
        background: document.getElementById('detailBackground'),
        objective: document.getElementById('detailObjective'),
        benefits: document.getElementById('detailBenefits'),
        strategy: document.getElementById('detailStrategy'),
        capCluster: document.getElementById('detailCapCluster'),
        budget: document.getElementById('detailBudget'),
        time: document.getElementById('detailTime'),
        timeline: document.getElementById('detailHistoryTimeline')
    };

    if (elements.title) elements.title.innerText = initiative.name;
    if (elements.meta) elements.meta.innerText = `${initiative.request_number} | Registered on ${formatDate(initiative.request_date)}`;
    if (elements.badge) {
        elements.badge.className = `badge ${escapeHtml(initiative.status)}`;
        elements.badge.innerText = initiative.status;
    }
    if (elements.background) elements.background.innerText = initiative.background;
    if (elements.objective) elements.objective.innerText = initiative.objective;
    if (elements.benefits) elements.benefits.innerText = initiative.potential_benefits;
    if (elements.strategy) elements.strategy.innerText = initiative.alignment_strategy;
    if (elements.capCluster) elements.capCluster.innerText = `${initiative.capability_type} -> ${initiative.capability_group} -> ${initiative.capability_title}`;
    if (elements.budget) elements.budget.innerText = formatCurrency(initiative.budget_estimate);
    if (elements.time) elements.time.innerText = initiative.time_estimate;

    renderDocumentationLinks(initiative);

    if (elements.timeline) {
        elements.timeline.innerHTML = '';
        const fragment = document.createDocumentFragment();
        history.forEach(h => {
            const node = document.createElement('div');
            node.className = 'timeline-node';
            node.innerHTML = `
                <span class="timeline-meta">${escapeHtml(formatDateTime(h.updated_at))}</span>
                <span class="timeline-desc">Changed state to <strong>${escapeHtml(h.to_status)}</strong> by ${escapeHtml(h.updated_by_name)}</span>
                <p style="font-size: 0.75rem; color:var(--text-secondary); margin-top:2px;">"${escapeHtml(h.comments || 'No remarks recorded')}"</p>
            `;
            fragment.appendChild(node);
        });
        elements.timeline.appendChild(fragment);
    }
}

function renderDocumentationLinks(initiative) {
    const docs = document.getElementById('detailExtraDocs');
    if (!docs) return;

    docs.style.display = 'none';

    if (initiative.status !== 'Submitted' && initiative.status !== 'Accepted') {
        docs.style.display = 'flex';

        const bcLink = document.getElementById('businessCaseLink');
        const solarchLink = document.getElementById('solarchReportLink');

        if (bcLink) {
            bcLink.innerHTML = `Business Case Status: <strong>${escapeHtml(initiative.business_case_status)}</strong> <br><small>${escapeHtml(initiative.business_case_url || 'https://sharepoint.unisa.local/bc')}</small>`;
        }
        if (solarchLink) {
            if (initiative.solarch_report_status === 'Completed') {
                solarchLink.innerHTML = `Solutions Architecture Report: <strong>${escapeHtml(initiative.solarch_report_status)}</strong> <br><small>${escapeHtml(initiative.solarch_report_url || 'https://sharepoint.unisa.local/report')}</small>`;
            } else {
                solarchLink.innerHTML = `SolArch Assessment Report: <span style="color:var(--warning)">In-Progress</span>`;
            }
        }
    }

    const strategicClassLink = document.getElementById('strategicClassLink');
    if (strategicClassLink) {
        strategicClassLink.style.display = 'none';
        if (initiative.strategic_classification) {
            strategicClassLink.style.display = 'block';
            const sc = initiative.strategic_classification;
            const impact = deriveStrategicImpact(sc);
            strategicClassLink.innerHTML = `
                <strong>Strategic Classification:</strong>
                Total Score: <strong>${formatNumber(sc.total_weighted_score)}</strong> |
                Category: <strong>${escapeHtml(sc.category)}</strong> |
                Impact: <strong>${escapeHtml(impact)}</strong>
            `;
        }
    }

    const steercoScoringLink = document.getElementById('steercoScoringLink');
    if (steercoScoringLink) {
        steercoScoringLink.style.display = 'none';
        if (initiative.steerco_scoring) {
            steercoScoringLink.style.display = 'block';
            const ss = initiative.steerco_scoring;
            steercoScoringLink.innerHTML = `
                <strong>SteerCo Scoring:</strong>
                Value: <strong>${formatNumber(ss.value)}</strong> |
                Ease: <strong>${formatNumber(ss.ease)}</strong> |
                Scored: <strong>${escapeHtml(formatDate(ss.scoring_date))}</strong>
            `;
        }
    }
}

// ============================================================
// DYNAMIC ACTION WORKSTATION (Refactored State Machine)
// ============================================================

function renderActionWorkstation(init) {
    const container = document.getElementById('actionFieldsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (init.status === 'Approved' || init.status === 'Declined') {
        container.innerHTML = `<p style="color:var(--text-secondary)">This initiative has concluded in state <strong>${escapeHtml(init.status)}</strong>. Workstation locked.</p>`;
        return;
    }

    const stateDef = WORKFLOW_STATES[init.status];
    if (!stateDef) {
        container.innerHTML = `<p style="color:var(--text-secondary)">Unknown status: ${escapeHtml(init.status)}</p>`;
        return;
    }

    const persona = Store.get('persona');
    const isAuthorized = stateDef.allowedRoles?.includes(persona.role) &&
                        (!stateDef.condition || stateDef.condition(init, persona));

    if (!isAuthorized) {
        const pendingRole = stateDef.allowedRoles.join(' or ');
        container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting <strong>${escapeHtml(pendingRole)}</strong> action.</p>`;
        return;
    }

    const config = stateDef.render(init, persona);
    const fragment = document.createDocumentFragment();

    if (config.badges?.length) {
        const badgeDiv = document.createElement('div');
        badgeDiv.style.cssText = 'display:flex;gap:12px;margin-bottom:12px;';
        badgeDiv.innerHTML = config.badges.join('');
        fragment.appendChild(badgeDiv);
    }

    if (config.message) {
        const p = document.createElement('p');
        p.style.cssText = 'font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;';
        p.innerHTML = config.message;
        fragment.appendChild(p);
    }

    config.fields?.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.style.marginBottom = '12px';

        const label = document.createElement('label');
        label.textContent = field.label;
        wrapper.appendChild(label);

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-input';
            if (field.placeholder) input.placeholder = field.placeholder;
        } else if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-input';
            field.options?.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.className = 'form-input';
            if (field.value) input.value = field.value;
            if (field.readonly) input.readOnly = true;
        }

        input.id = field.id;
        wrapper.appendChild(input);
        fragment.appendChild(wrapper);
    });

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex; gap:12px;';
    config.actions?.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'action-btn';
        button.textContent = btn.label;
        button.style.background = `var(--${btn.style})`;

        button.addEventListener('click', async () => {
            if (btn.confirm) {
                const confirmed = await showConfirmDialog(`Are you sure you want to ${btn.label.toLowerCase()} this initiative?`);
                if (!confirmed) return;
            }
            executeTransition(btn.action, btn.arg);
        });

        btnGroup.appendChild(button);
    });
    fragment.appendChild(btnGroup);

    container.appendChild(fragment);
}

// ============================================================
// WORKFLOW STATE TRANSITIONS
// ============================================================

async function executeTransition(actionType, extraArg) {
    const id = Store.get('selectedId');
    if (!id) return;

    let payload = {};

    switch (actionType) {
        case 'accept':
            payload = {
                action: extraArg,
                comments: document.getElementById('ownerComments')?.value || ''
            };
            break;
        case 'assign':
            if (extraArg === 'Park') {
                payload = { action: 'Park' };
            } else {
                const selectVal = document.getElementById('assignReviewer')?.value.split('|') || [];
                payload = {
                    reviewer_email: selectVal[0],
                    reviewer_name: selectVal[1],
                    action: 'Assign'
                };
            }
            break;
        case 'review':
            payload = {
                business_case_status: document.getElementById('reviewBcStatus')?.value,
                initiative_impact_class: document.getElementById('reviewImpact')?.value || 'Medium'
            };
            break;
        case 'assess':
            payload = {
                solarch_report_status: document.getElementById('assessReportStatus')?.value
            };
            break;
        case 'recommend':
            payload = {
                recommendation: document.getElementById('recommendDecision')?.value
            };
            break;
        case 'approve':
            payload = {
                approval_action: document.getElementById('steercoDecision')?.value,
                comments: document.getElementById('approveComments')?.value || ''
            };
            break;
        case 'unpark':
            payload = {
                comments: document.getElementById('unparkComments')?.value || ''
            };
            break;
        default:
            console.warn('Unknown action type:', actionType);
            return;
    }

    setLoading(true);
    try {
        const resData = await apiRequest(`/initiatives/${id}/${actionType}`, {
            method: 'POST',
            body: payload
        });
        showToast(resData.message, resData.success ? 'success' : 'warning');

        if (resData.success) {
            await loadAllInitiatives();
            setTimeout(() => viewInitiativeDetail(id), 300);
        }
    } catch (e) {
        showToast("Simulating workflow state update locally...", 'warning');
        simulateTransition(id, actionType, extraArg, payload);
    } finally {
        setLoading(false);
    }
}

function simulateTransition(id, actionType, extraArg, payload) {
    const initiatives = Store.get('initiatives');
    const idx = initiatives.findIndex(i => i.id === id);
    if (idx === -1) return;

    const target = { ...initiatives[idx] };

    switch (actionType) {
        case 'accept':
            target.status = extraArg === 'Accept' ? 'Accepted' : 'Declined';
            if (extraArg === 'Decline') target.decline_reason = payload.comments;
            break;
        case 'assign':
            target.status = extraArg === 'Park' ? 'Parked' : 'Reviewed';
            if (payload.reviewer_name) {
                target.reviewer_name = payload.reviewer_name;
                target.reviewer_email = payload.reviewer_email;
            }
            break;
        case 'review':
            target.business_case_status = payload.business_case_status;
            target.status = payload.business_case_status === 'Signed-Fully' ? 'SolArch' : 'Reviewed';
            break;
        case 'assess':
            target.solarch_report_status = payload.solarch_report_status;
            target.status = payload.solarch_report_status === 'Completed' ? 'Assessed' : 'SolArch';
            break;
        case 'recommend':
            target.status = payload.recommendation;
            break;
        case 'approve':
            target.status = payload.approval_action;
            break;
        case 'unpark':
            target.status = 'Accepted';
            break;
    }

    initiatives[idx] = target;
    Store.set('initiatives', initiatives);
    renderOverviewStats();
    renderInboxLists();
    setTimeout(() => viewInitiativeDetail(id), 300);
}

// ============================================================
// STRATEGIC CLASSIFICATION ENGINE
// ============================================================

function renderStrategicClassificationList() {
    const container = document.getElementById('strategicClassifictionInitiativesList');
    const matrix = document.getElementById('strategicClassificationMatrix');
    if (matrix) matrix.style.display = 'none';
    if (!container) return;

    container.innerHTML = '';
    const initiatives = Store.get('initiatives');
    const eligible = initiatives.filter(i =>
        i.status !== 'Submitted' && i.status !== 'Draft' && i.status !== 'Declined'
    );

    if (eligible.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);padding:20px;" role="status">No initiatives available for classification.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    eligible.forEach(init => {
        const classified = init.strategic_classification ? ' (Classified)' : '';
        const div = document.createElement('div');
        div.className = 'initiative-item';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `Classify ${init.name}`);
        div.addEventListener('click', () => classifyInitiative(init.id));
        div.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                classifyInitiative(init.id);
            }
        });
        div.innerHTML = `
            <div class="item-left">
                <span class="badge ${escapeHtml(init.status)}">${escapeHtml(init.status)}</span>
                <span class="item-title" style="margin-top:6px;">${escapeHtml(init.name)}${escapeHtml(classified)}</span>
            </div>
            <div aria-hidden="true">
                <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </div>
        `;
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
}

function classifyInitiative(id) {
    Store.set('selectedId', id);
    const initiative = Store.get('initiatives').find(i => i.id === id);
    if (!initiative) return;

    switchView('strategic-classification');
    const matrix = document.getElementById('strategicClassificationMatrix');
    if (!matrix) return;
    matrix.style.display = 'block';

    const saved = initiative.strategic_classification?.scores || {};
    Store.set('pendingScores', new Map(Object.entries(saved)));

    let html = `
        <h3 style="margin-bottom:8px;">Strategic Classification Matrix</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px;">
            Scoring: <strong>${escapeHtml(initiative.name)}</strong>
        </p>
        <table class="classification-table">
            <thead>
                <tr>
                    <th style="width:40%;">Strategic Pillar / Enabler</th>
                    <th style="width:20%;">Weight</th>
                    <th style="width:20%;">Score (0-5)</th>
                    <th style="width:20%;">Weighted</th>
                </tr>
            </thead>
            <tbody>
    `;

    STRATEGIC_FRAMEWORK.pillars.forEach((pillar, i) => {
        const savedScore = saved[pillar.name] || 0;
        const weighted = (savedScore * pillar.weight / 10).toFixed(1);
        html += `
            <tr>
                <td>${escapeHtml(pillar.name)}</td>
                <td>${pillar.weight}</td>
                <td>
                    <select class="sc-score-select" data-pillar="${escapeHtml(pillar.name)}" onchange="updateSCScore(this)">
                        ${[0,1,5,10].map(s => `<option value="${s}" ${s === savedScore ? 'selected' : ''}>${s === 0 ? 'None (0)' : s === 1 ? 'Low (1)' : s === 5 ? 'Moderate (5)' : 'High (10)'}</option>`).join('')}
                    </select>
                </td>
                <td id="w_${i}">${weighted}</td>
            </tr>
        `;
    });

    const result = calculateStrategicClassification(saved);

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Total Weighted Score</strong></td>
                    <td></td>
                    <td></td>
                    <td id="scTotalCell">${formatNumber(result.total)}</td>
                </tr>
                <tr>
                    <td><strong>Classification</strong></td>
                    <td></td>
                    <td></td>
                    <td id="scCategoryCell">${escapeHtml(result.category)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;">
            <button class="action-btn" onclick="submitStrategicClassification()">Save Classification</button>
        </div>
    `;

    matrix.innerHTML = html;
}

function updateSCScore(select) {
    const pillar = select.getAttribute('data-pillar');
    const score = parseInt(select.value);
    const scores = Store.get('pendingScores');
    scores.set(pillar, score);
    Store.set('pendingScores', scores);

    const result = calculateStrategicClassification(Object.fromEntries(scores));

    STRATEGIC_FRAMEWORK.pillars.forEach((p, i) => {
        const s = scores.get(p.name) || 0;
        const weighted = (s * p.weight / 10).toFixed(1);
        const cell = document.getElementById(`w_${i}`);
        if (cell) cell.innerText = weighted;
    });

    const totalCell = document.getElementById('scTotalCell');
    const categoryCell = document.getElementById('scCategoryCell');
    if (totalCell) totalCell.innerText = formatNumber(result.total);
    if (categoryCell) categoryCell.innerText = result.category;
}

async function submitStrategicClassification() {
    const id = Store.get('selectedId');
    const scores = Object.fromEntries(Store.get('pendingScores'));
    const result = calculateStrategicClassification(scores);

    setLoading(true);
    try {
        const resData = await apiRequest(`/initiatives/${id}/strategic-classification`, {
            method: 'POST',
            body: {
                scores,
                total_weighted_score: result.total,
                category: result.category
            }
        });
        showToast(resData.message, resData.success ? 'success' : 'warning');
        if (resData.success) {
            await loadAllInitiatives();
            renderStrategicClassificationList();
        }
    } catch (e) {
        showToast("Offline: Classification saved locally.", 'warning');
        const initiatives = Store.get('initiatives');
        const idx = initiatives.findIndex(i => i.id === id);
        if (idx !== -1) {
            initiatives[idx] = {
                ...initiatives[idx],
                strategic_classification: { scores, total_weighted_score: result.total, category: result.category }
            };
            Store.set('initiatives', initiatives);
        }
    } finally {
        setLoading(false);
    }
}

// ============================================================
// STEERCO SCORING ENGINE
// ============================================================

const STEERCO_DIMENSIONS = [
    { key: 'ict_demand', label: 'Type of ICT Demand', desc: 'Complexity of the ICT demand' },
    { key: 'effort', label: 'Effort', desc: 'Estimated effort required' },
    { key: 'system_readiness', label: 'System Readiness', desc: 'Most appropriate system option' },
    { key: 'cost', label: 'Cost', desc: 'Financial cost impact' },
    { key: 'likelihood_success', label: 'Likelihood of Success', desc: 'Probability of successful delivery' },
    { key: 'resources', label: 'Resources', desc: 'Human Resources required' }
];

const STEERCO_OPTIONS = {
    ict_demand: [
        { value: 1, label: 'Tactical Demand (1)' },
        { value: 5, label: 'Operational Demand (5)' },
        { value: 10, label: 'Strategic Demand (10)' }
    ],
    effort: [
        { value: 1, label: '> 6 months (1)' },
        { value: 5, label: '> 2 months and \u2264 6 months (5)' },
        { value: 10, label: '\u2264 2 months (10)' }
    ],
    system_readiness: [
        { value: 1, label: 'Major custom dev required (1)' },
        { value: 5, label: 'Minor custom dev required (5)' },
        { value: 10, label: 'Off-The-Shelf system (10)' }
    ],
    cost: [
        { value: 1, label: '> R5m (1)' },
        { value: 5, label: '> R1m and \u2264 R5m (5)' },
        { value: 10, label: '\u2264 R1m (10)' }
    ],
    likelihood_success: [
        { value: 1, label: 'Even odds (1)' },
        { value: 5, label: 'Good odds (5)' },
        { value: 10, label: 'Great odds (10)' }
    ],
    resources: [
        { value: 1, label: '> 10 (1)' },
        { value: 5, label: '> 6 and \u2264 10 (5)' },
        { value: 10, label: '\u2264 6 (10)' }
    ]
};

function renderSteercoScoringList() {
    const container = document.getElementById('steercoScoringInitiativesList');
    const matrix = document.getElementById('steercoScoringMatrix');
    if (matrix) matrix.style.display = 'none';
    if (!container) return;

    container.innerHTML = '';
    const initiatives = Store.get('initiatives');
    const eligible = initiatives.filter(i =>
        i.strategic_classification && i.status !== 'Submitted' && i.status !== 'Draft' && i.status !== 'Declined'
    );

    if (eligible.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);padding:20px;" role="status">No initiatives with Strategic Classification available for SteerCo scoring.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    eligible.forEach(init => {
        const scored = init.steerco_scoring ? ' (Scored)' : '';
        const div = document.createElement('div');
        div.className = 'initiative-item';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `Score ${init.name}`);
        div.addEventListener('click', () => calculateSteercoScore(init.id));
        div.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                calculateSteercoScore(init.id);
            }
        });
        div.innerHTML = `
            <div class="item-left">
                <span class="badge ${escapeHtml(init.status)}">${escapeHtml(init.status)}</span>
                <span class="item-title" style="margin-top:6px;">${escapeHtml(init.name)}${escapeHtml(scored)}</span>
            </div>
            <div aria-hidden="true">
                <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </div>
        `;
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
}

function calculateSteercoScore(id) {
    Store.set('selectedId', id);
    const initiative = Store.get('initiatives').find(i => i.id === id);
    if (!initiative) return;

    switchView('steerco-scoring');
    const matrix = document.getElementById('steercoScoringMatrix');
    if (!matrix) return;
    matrix.style.display = 'block';

    const sc = initiative.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const saved = initiative.steerco_scoring?.dimensions || {};
    Store.set('pendingSteercoScores', new Map(Object.entries({
        ict_demand: saved.ict_demand || 5,
        effort: saved.effort || 5,
        system_readiness: scNumeric,
        cost: saved.cost || 5,
        likelihood_success: saved.likelihood_success || 5,
        resources: saved.resources || 5
    })));

    let html = `
        <h3 style="margin-bottom:8px;">SteerCo Value & Ease Scoring Matrix</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px;">
            Scoring: <strong>${escapeHtml(initiative.name)}</strong> | SC Score: <strong>${scNumeric}</strong>
        </p>
        <table class="classification-table">
            <thead>
                <tr>
                    <th style="width:35%;">Dimension</th>
                    <th style="width:35%;">Description</th>
                    <th style="width:30%;">Score</th>
                </tr>
            </thead>
            <tbody>
    `;

    STEERCO_DIMENSIONS.forEach(dim => {
        const val = Store.get('pendingSteercoScores').get(dim.key);
        const options = STEERCO_OPTIONS[dim.key];

        html += `
            <tr>
                <td><strong>${escapeHtml(dim.label)}</strong></td>
                <td style="font-size:0.85rem;color:var(--text-secondary);">${escapeHtml(dim.desc)}</td>
                <td>
                    <select class="sc-score-select" onchange="updateSteercoScore('${dim.key}', this.value)">
                        ${options.map(o => `<option value="${o.value}" ${o.value === val ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
                    </select>
                </td>
            </tr>
        `;
    });

    const value = calculateSteercoValue(scNumeric, Store.get('pendingSteercoScores').get('ict_demand') || 5);
    const ease = calculateSteercoEase(Object.fromEntries(Store.get('pendingSteercoScores')));

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Value (SC + ICT Demand)</strong></td>
                    <td></td>
                    <td id="steercoValueCell">${formatNumber(value)}</td>
                </tr>
                <tr>
                    <td><strong>Ease (Sum of 5 dimensions)</strong></td>
                    <td></td>
                    <td id="steercoEaseCell">${formatNumber(ease)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;">
            <button class="action-btn" onclick="submitSteercoScoring()">Save SteerCo Scores</button>
        </div>
    `;

    matrix.innerHTML = html;
}

function updateSteercoScore(key, value) {
    const scores = Store.get('pendingSteercoScores');
    scores.set(key, parseInt(value));
    Store.set('pendingSteercoScores', scores);

    const initiative = Store.get('initiatives').find(i => i.id === Store.get('selectedId'));
    const sc = initiative?.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const valueScore = calculateSteercoValue(scNumeric, scores.get('ict_demand') || 5);
    const easeScore = calculateSteercoEase(Object.fromEntries(scores));

    const valueCell = document.getElementById('steercoValueCell');
    const easeCell = document.getElementById('steercoEaseCell');
    if (valueCell) valueCell.innerText = formatNumber(valueScore);
    if (easeCell) easeCell.innerText = formatNumber(easeScore);
}

async function submitSteercoScoring() {
    const id = Store.get('selectedId');
    const sc = Store.get('initiatives').find(i => i.id === id)?.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const scores = Store.get('pendingSteercoScores');
    const payload = {
        strategic_classification_score: scNumeric,
        ict_demand: scores.get('ict_demand') || 5,
        effort: scores.get('effort') || 5,
        system_readiness: scores.get('system_readiness') || scNumeric,
        cost: scores.get('cost') || 5,
        likelihood_success: scores.get('likelihood_success') || 5,
        resources: scores.get('resources') || 5
    };

    setLoading(true);
    try {
        const response = await apiRequest(`/initiatives/${id}/steerco-scoring`, {
            method: 'POST',
            body: payload
        });
        showToast(response.message, response.success ? 'success' : 'warning');
        if (response.success) {
            await loadAllInitiatives();
            renderSteercoScoringList();
        }
    } catch (e) {
        const value = calculateSteercoValue(scNumeric, payload.ict_demand);
        const ease = calculateSteercoEase(payload);

        showToast("Offline: SteerCo scores saved locally.", 'warning');
        const initiatives = Store.get('initiatives');
        const idx = initiatives.findIndex(i => i.id === id);
        if (idx !== -1) {
            initiatives[idx] = {
                ...initiatives[idx],
                steerco_scoring: {
                    value,
                    ease,
                    dimensions: payload,
                    scoring_date: new Date().toISOString()
                }
            };
            Store.set('initiatives', initiatives);
        }
    } finally {
        setLoading(false);
    }
}

// ============================================================
// EXECUTIVE REPORTING ENGINE
// ============================================================

function renderReports() {
    const tableBody = document.querySelector('#reportTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const initiatives = Store.get('initiatives');

    let totalVal = 0;
    const fragment = document.createDocumentFragment();

    initiatives.forEach(init => {
        totalVal += init.budget_estimate;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
            <td style="padding: 12px; font-weight:600;">${escapeHtml(init.request_number)}</td>
            <td style="padding: 12px;">${escapeHtml(init.name)}</td>
            <td style="padding: 12px;">${escapeHtml(init.requester_name)}</td>
            <td style="padding: 12px; font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(init.alignment_strategy.split(':')[0])}</td>
            <td style="padding: 12px;"><span class="badge ${escapeHtml(init.status)}">${escapeHtml(init.status)}</span></td>
            <td style="padding: 12px; font-weight:600; text-align:right;">${formatCurrency(init.budget_estimate)}</td>
        `;
        fragment.appendChild(tr);
    });

    tableBody.appendChild(fragment);

    const reportValue = document.getElementById('reportValue');
    if (reportValue) reportValue.innerText = formatCurrency(totalVal);
}

// ============================================================
// LIFE CYCLE INITIALIZER
// ============================================================
window.onload = function() {
    changePersona();
    populateCapTypes();
    loadAllInitiatives();
};

// ============================================================
// SHAREPOINT DOCUMENT INTEGRATION MODULE (Option B)
// Microsoft Graph API + Deep Link Upload
// ============================================================

const SHAREPOINT_CONFIG = {
    siteUrl: window.IDM_CONFIG?.SHAREPOINT_SITE || 'https://unisa.sharepoint.com/sites/IDMF',
    siteId: window.IDM_CONFIG?.SHAREPOINT_SITE_ID || 'unisa.sharepoint.com,12345678-1234-1234-1234-123456789012,abcdef12-3456-7890-abcd-ef1234567890',
    driveId: window.IDM_CONFIG?.SHAREPOINT_DRIVE_ID || 'b!abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    documentLibraries: {
        businessCases: '/BusinessCases',
        solarchReports: '/SolArchReports',
        strategicClassifications: '/StrategicClassifications',
        steercoPacks: '/SteerCoPacks'
    },
    pollingInterval: 30000, // 30 seconds
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt']
};

// ============================================================
// MICROSOFT GRAPH API CLIENT
// ============================================================

class SharePointClient {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getToken() {
        // In production, this would use MSAL.js for silent token acquisition
        // For demo/development, check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        // Attempt to get token from backend (token exchange pattern)
        try {
            const response = await apiRequest('/auth/sharepoint-token');
            if (response.success) {
                this.accessToken = response.token;
                this.tokenExpiry = Date.now() + (response.expiresIn * 1000);
                return this.accessToken;
            }
        } catch (e) {
            console.warn('SharePoint token unavailable, using demo mode');
        }

        return null;
    }

    async makeGraphRequest(endpoint, options = {}) {
        const token = await this.getToken();
        if (!token) {
            throw new Error('SharePoint authentication required');
        }

        const url = `https://graph.microsoft.com/v1.0${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Graph API error: ${response.status}`);
        }

        return response.json();
    }

    // Get or create folder for initiative
    async ensureInitiativeFolder(initiativeId, documentType) {
        const libraryPath = SHAREPOINT_CONFIG.documentLibraries[documentType];
        const folderPath = `${libraryPath}/${initiativeId}`;

        try {
            // Try to get folder
            return await this.makeGraphRequest(
                `/sites/${SHAREPOINT_CONFIG.siteId}/drive/root:${folderPath}`
            );
        } catch (e) {
            // Folder doesn't exist, create it
            return await this.makeGraphRequest(
                `/sites/${SHAREPOINT_CONFIG.siteId}/drive/root:${libraryPath}:/children`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name: initiativeId,
                        folder: {},
                        '@microsoft.graph.conflictBehavior': 'fail'
                    })
                }
            );
        }
    }

    // List documents in initiative folder
    async listDocuments(initiativeId, documentType) {
        const libraryPath = SHAREPOINT_CONFIG.documentLibraries[documentType];
        const folderPath = `${libraryPath}/${initiativeId}`;

        try {
            const result = await this.makeGraphRequest(
                `/sites/${SHAREPOINT_CONFIG.siteId}/drive/root:${folderPath}:/children`
            );
            return result.value || [];
        } catch (e) {
            return []; // Folder may not exist yet
        }
    }

    // Get document download URL
    async getDocumentUrl(itemId) {
        const result = await this.makeGraphRequest(
            `/sites/${SHAREPOINT_CONFIG.siteId}/drive/items/${itemId}`
        );
        return result.webUrl || result['@microsoft.graph.downloadUrl'];
    }

    // Delete document
    async deleteDocument(itemId) {
        await this.makeGraphRequest(
            `/sites/${SHAREPOINT_CONFIG.siteId}/drive/items/${itemId}`,
            { method: 'DELETE' }
        );
    }
}

// Global SharePoint client instance
const spClient = new SharePointClient();

// ============================================================
// DOCUMENT STATUS POLLING & SYNC
// ============================================================

class DocumentSyncManager {
    constructor() {
        this.pollingTimers = new Map();
        this.lastKnownDocuments = new Map();
    }

    startPolling(initiativeId) {
        this.stopPolling(initiativeId);

        // Immediate first sync
        this.syncDocuments(initiativeId);

        // Set up interval
        const timer = setInterval(() => {
            this.syncDocuments(initiativeId);
        }, SHAREPOINT_CONFIG.pollingInterval);

        this.pollingTimers.set(initiativeId, timer);
    }

    stopPolling(initiativeId) {
        const timer = this.pollingTimers.get(initiativeId);
        if (timer) {
            clearInterval(timer);
            this.pollingTimers.delete(initiativeId);
        }
    }

    stopAllPolling() {
        this.pollingTimers.forEach(timer => clearInterval(timer));
        this.pollingTimers.clear();
    }

    async syncDocuments(initiativeId) {
        const initiative = Store.get('initiatives').find(i => i.id === initiativeId);
        if (!initiative) return;

        try {
            const documentTypes = ['businessCases', 'solarchReports', 'strategicClassifications', 'steercoPacks'];
            const updates = {};

            for (const docType of documentTypes) {
                const documents = await spClient.listDocuments(initiativeId, docType);
                const key = this.getStatusKey(docType);

                // Check if documents exist vs. previous state
                const previous = this.lastKnownDocuments.get(`${initiativeId}-${docType}`) || [];
                const hasNewDocuments = documents.length > 0;
                const hadDocuments = previous.length > 0;

                if (hasNewDocuments !== hadDocuments || documents.length !== previous.length) {
                    updates[key] = hasNewDocuments ? 'Signed-Fully' : 'In-Progress';
                    this.lastKnownDocuments.set(`${initiativeId}-${docType}`, documents);
                }

                // Store document metadata for UI
                Store.update('documentMetadata', (current = {}) => {
                    const updated = { ...current };
                    if (!updated[initiativeId]) updated[initiativeId] = {};
                    updated[initiativeId][docType] = documents.map(doc => ({
                        id: doc.id,
                        name: doc.name,
                        size: doc.size,
                        createdDateTime: doc.createdDateTime,
                        lastModifiedDateTime: doc.lastModifiedDateTime,
                        webUrl: doc.webUrl,
                        createdBy: doc.createdBy?.user?.displayName,
                        downloadUrl: doc['@microsoft.graph.downloadUrl']
                    }));
                    return updated;
                });
            }

            // Update initiative status if documents changed
            if (Object.keys(updates).length > 0) {
                const initiatives = Store.get('initiatives');
                const idx = initiatives.findIndex(i => i.id === initiativeId);
                if (idx !== -1) {
                    initiatives[idx] = { ...initiatives[idx], ...updates };
                    Store.set('initiatives', initiatives);

                    // Refresh UI if viewing this initiative
                    if (Store.get('selectedId') === initiativeId) {
                        renderDocumentationLinks(initiatives[idx]);
                    }
                }
            }
        } catch (e) {
            console.warn('Document sync failed:', e);
        }
    }

    getStatusKey(docType) {
        const mapping = {
            businessCases: 'business_case_status',
            solarchReports: 'solarch_report_status',
            strategicClassifications: 'strategic_classification_status',
            steercoPacks: 'steerco_pack_status'
        };
        return mapping[docType];
    }
}

const documentSync = new DocumentSyncManager();

// ============================================================
// SHAREPOINT DEEP LINK UPLOAD
// ============================================================

/**
 * Generate SharePoint deep link for document upload
 * Opens SharePoint in a modal-friendly window with pre-populated metadata
 */
function openSharePointUpload(initiativeId, documentType, initiativeName) {
    const libraryPath = SHAREPOINT_CONFIG.documentLibraries[documentType];
    const folderPath = `${libraryPath}/${initiativeId}`;

    // Build SharePoint upload URL with metadata
    const params = new URLSearchParams({
        'List': SHAREPOINT_CONFIG.driveId,
        'RootFolder': folderPath,
        'Metadata_InitiativeID': initiativeId,
        'Metadata_InitiativeName': initiativeName,
        'Metadata_DocumentType': documentType,
        'Metadata_UploadedBy': Store.get('persona').email,
        'Metadata_UploadDate': new Date().toISOString()
    });

    const uploadUrl = `${SHAREPOINT_CONFIG.siteUrl}/_layouts/15/Upload.aspx?${params.toString()}`;

    // Open in centered popup
    const width = 1000;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
        uploadUrl,
        'sharepointUpload',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    // Monitor popup closure to trigger sync
    const checkClosed = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkClosed);
            showToast('Document upload window closed. Syncing...', 'info');
            documentSync.syncDocuments(initiativeId);
        }
    }, 1000);

    // Start polling for changes
    documentSync.startPolling(initiativeId);

    return popup;
}

/**
 * Alternative: Direct browser upload via Graph API (large files)
 * Uses resumable upload session for files > 4MB
 */
async function uploadDocumentDirectly(file, initiativeId, documentType) {
    // Validate file
    if (file.size > SHAREPOINT_CONFIG.maxFileSize) {
        throw new ValidationError(`File exceeds ${SHAREPOINT_CONFIG.maxFileSize / 1024 / 1024}MB limit`);
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!SHAREPOINT_CONFIG.allowedTypes.includes(ext)) {
        throw new ValidationError(`File type ${ext} not allowed. Accepted: ${SHAREPOINT_CONFIG.allowedTypes.join(', ')}`);
    }

    setLoading(true);
    try {
        // Ensure folder exists
        await spClient.ensureInitiativeFolder(initiativeId, documentType);

        const libraryPath = SHAREPOINT_CONFIG.documentLibraries[documentType];
        const filePath = `${libraryPath}/${initiativeId}/${file.name}`;

        let uploadResult;

        if (file.size < 4 * 1024 * 1024) {
            // Simple upload for small files
            uploadResult = await spClient.makeGraphRequest(
                `/sites/${SHAREPOINT_CONFIG.siteId}/drive/root:${filePath}:/content`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type || 'application/octet-stream' },
                    body: file
                }
            );
        } else {
            // Resumable upload for large files
            uploadResult = await uploadLargeFile(file, filePath);
        }

        // Update metadata
        await spClient.makeGraphRequest(
            `/sites/${SHAREPOINT_CONFIG.siteId}/drive/items/${uploadResult.id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    fields: {
                        InitiativeID: initiativeId,
                        DocumentType: documentType,
                        UploadedBy: Store.get('persona').email
                    }
                })
            }
        );

        showToast(`Document "${file.name}" uploaded successfully`, 'success');

        // Trigger sync
        await documentSync.syncDocuments(initiativeId);

        return uploadResult;
    } finally {
        setLoading(false);
    }
}

async function uploadLargeFile(file, filePath) {
    // Create upload session
    const session = await spClient.makeGraphRequest(
        `/sites/${SHAREPOINT_CONFIG.siteId}/drive/root:${filePath}:/createUploadSession`,
        {
            method: 'POST',
            body: JSON.stringify({
                item: {
                    '@microsoft.graph.conflictBehavior': 'replace',
                    name: file.name
                }
            })
        }
    );

    // Upload in chunks
    const chunkSize = 320 * 1024; // 320KB chunks
    let start = 0;
    let uploadResult;

    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const response = await fetch(session.uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Length': chunk.size,
                'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
            },
            body: chunk
        });

        if (!response.ok && response.status !== 308) {
            throw new Error('Upload chunk failed');
        }

        if (end === file.size) {
            uploadResult = await response.json();
        }

        start = end;
    }

    return uploadResult;
}

// ============================================================
// DOCUMENT RENDERING (Enhanced)
// ============================================================

function renderDocumentationLinks(initiative) {
    const docs = document.getElementById('detailExtraDocs');
    if (!docs) return;

    docs.style.display = 'none';

    if (initiative.status !== 'Submitted' && initiative.status !== 'Accepted') {
        docs.style.display = 'flex';

        renderBusinessCaseSection(initiative);
        renderSolArchSection(initiative);
        renderStrategicClassSection(initiative);
        renderSteerCoPackSection(initiative);
    }

    // Start polling when viewing detail
    documentSync.startPolling(initiative.id);
}

function renderBusinessCaseSection(initiative) {
    const container = document.getElementById('businessCaseLink');
    if (!container) return;

    const metadata = Store.get('documentMetadata')?.[initiative.id]?.businessCases || [];
    const hasDocuments = metadata.length > 0;
    const status = hasDocuments ? 'Signed-Fully' : (initiative.business_case_status || 'In-Progress');

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span>Business Case Status: <strong>${escapeHtml(status)}</strong></span>`;

    // Upload button for authorized roles
    const persona = Store.get('persona');
    if (['Initiative Owner', 'Demand Planner', 'Solutions Architect'].includes(persona.role)) {
        html += `<button class="action-btn" style="padding:6px 12px;font-size:0.8rem;" 
            onclick="openDocumentUpload('${initiative.id}', 'businessCases', '${escapeHtml(initiative.name)}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4"/></svg>
            Upload
        </button>`;
    }

    html += `</div>`;

    // Document list
    if (hasDocuments) {
        html += `<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">`;
        metadata.forEach(doc => {
            html += renderDocumentItem(doc, initiative.id, 'businessCases');
        });
        html += `</div>`;
    } else {
        html += `<small style="color:var(--text-secondary);">No documents uploaded yet. Click Upload to add via SharePoint.</small>`;
    }

    container.innerHTML = html;
}

function renderSolArchSection(initiative) {
    const container = document.getElementById('solarchReportLink');
    if (!container) return;

    const metadata = Store.get('documentMetadata')?.[initiative.id]?.solarchReports || [];
    const hasDocuments = metadata.length > 0;
    const status = hasDocuments ? 'Completed' : (initiative.solarch_report_status || 'In-Progress');

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span>SolArch Assessment Report: <strong>${escapeHtml(status)}</strong></span>`;

    const persona = Store.get('persona');
    if (persona.role === 'Solutions Architect') {
        html += `<button class="action-btn" style="padding:6px 12px;font-size:0.8rem;" 
            onclick="openDocumentUpload('${initiative.id}', 'solarchReports', '${escapeHtml(initiative.name)}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4"/></svg>
            Upload Report
        </button>`;
    }

    html += `</div>`;

    if (hasDocuments) {
        html += `<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">`;
        metadata.forEach(doc => {
            html += renderDocumentItem(doc, initiative.id, 'solarchReports');
        });
        html += `</div>`;
    } else {
        html += `<small style="color:var(--text-secondary);">No SolArch report uploaded yet.</small>`;
    }

    container.innerHTML = html;
}

function renderStrategicClassSection(initiative) {
    const container = document.getElementById('strategicClassLink');
    if (!container) return;

    const metadata = Store.get('documentMetadata')?.[initiative.id]?.strategicClassifications || [];
    const hasDocuments = metadata.length > 0;

    container.style.display = initiative.strategic_classification ? 'block' : 'none';
    if (!initiative.strategic_classification) return;

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>Strategic Classification:</strong>`;

    const persona = Store.get('persona');
    if (['Demand Planner', 'Solutions Architect'].includes(persona.role)) {
        html += `<button class="action-btn" style="padding:6px 12px;font-size:0.8rem;" 
            onclick="openDocumentUpload('${initiative.id}', 'strategicClassifications', '${escapeHtml(initiative.name)}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4"/></svg>
            Attach Evidence
        </button>`;
    }

    html += `</div>`;
    html += `Total Score: <strong>${formatNumber(initiative.strategic_classification.total_weighted_score)}</strong> | 
             Category: <strong>${escapeHtml(initiative.strategic_classification.category)}</strong>`;

    if (hasDocuments) {
        html += `<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">`;
        metadata.forEach(doc => {
            html += renderDocumentItem(doc, initiative.id, 'strategicClassifications');
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

function renderSteerCoPackSection(initiative) {
    // Check if steerco pack section exists, create if not
    let container = document.getElementById('steercoPackLink');
    if (!container) {
        const docsContainer = document.getElementById('detailExtraDocs');
        if (docsContainer) {
            container = document.createElement('div');
            container.id = 'steercoPackLink';
            container.style.cssText = 'padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.85rem;';
            docsContainer.appendChild(container);
        }
    }
    if (!container) return;

    const metadata = Store.get('documentMetadata')?.[initiative.id]?.steercoPacks || [];
    const hasDocuments = metadata.length > 0;

    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>SteerCo Pack:</strong>`;

    const persona = Store.get('persona');
    if (persona.role === 'ICT SteerCo Secretariat') {
        html += `<button class="action-btn" style="padding:6px 12px;font-size:0.8rem;" 
            onclick="openDocumentUpload('${initiative.id}', 'steercoPacks', '${escapeHtml(initiative.name)}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4"/></svg>
            Upload Pack
        </button>`;
    }

    html += `</div>`;

    if (hasDocuments) {
        html += `<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">`;
        metadata.forEach(doc => {
            html += renderDocumentItem(doc, initiative.id, 'steercoPacks');
        });
        html += `</div>`;
    } else {
        html += `<small style="color:var(--text-secondary);">No SteerCo pack uploaded yet.</small>`;
    }

    container.innerHTML = html;
}

function renderDocumentItem(doc, initiativeId, docType) {
    const sizeFormatted = formatFileSize(doc.size);
    const dateFormatted = formatDate(doc.lastModifiedDateTime);

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">
            <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
                <span style="font-size:1.2rem;">📄</span>
                <div style="overflow:hidden;">
                    <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(doc.name)}</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">${sizeFormatted} • ${dateFormatted} • ${escapeHtml(doc.createdBy || 'Unknown')}</div>
                </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
                <a href="${escapeHtml(doc.webUrl)}" target="_blank" rel="noopener" 
                   class="action-btn" style="padding:4px 10px;font-size:0.75rem;text-decoration:none;"
                   title="Open in SharePoint">
                    Open
                </a>
                ${doc.downloadUrl ? `
                <a href="${escapeHtml(doc.downloadUrl)}" download 
                   class="action-btn" style="padding:4px 10px;font-size:0.75rem;text-decoration:none;background:var(--success);"
                   title="Download">
                    ⬇
                </a>` : ''}
                <button onclick="deleteDocument('${doc.id}', '${initiativeId}', '${docType}')" 
                        class="action-btn" style="padding:4px 10px;font-size:0.75rem;background:var(--danger);"
                        title="Delete">
                    🗑
                </button>
            </div>
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ============================================================
// DOCUMENT UPLOAD INTERFACE
// ============================================================

function openDocumentUpload(initiativeId, documentType, initiativeName) {
    // Check if we have Graph API access
    const hasGraphAccess = !!sessionStorage.getItem('idm_token');

    if (hasGraphAccess) {
        // Show upload method choice
        showUploadMethodDialog(initiativeId, documentType, initiativeName);
    } else {
        // Fallback to SharePoint deep link
        openSharePointUpload(initiativeId, documentType, initiativeName);
    }
}

function showUploadMethodDialog(initiativeId, documentType, initiativeName) {
    const existing = document.querySelector('.upload-method-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'upload-method-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:10002;animation:fadeIn 0.2s ease-out;';
    overlay.innerHTML = `
        <div style="background:#ffffff;border-radius:16px;padding:32px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;animation:toastSlide 0.3s ease-out;">
            <div style="font-size:2.5rem;margin-bottom:12px;">📤</div>
            <h3 style="margin-bottom:8px;">Upload Document</h3>
            <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:24px;">
                Choose how you want to upload documents for <strong>${escapeHtml(initiativeName)}</strong>
            </p>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <button class="action-btn" onclick="this.closest('.upload-method-overlay').remove(); openDirectUpload('${initiativeId}', '${documentType}');" style="justify-content:center;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4"/></svg>
                    Upload Directly (Fast)
                </button>
                <button class="action-btn" onclick="this.closest('.upload-method-overlay').remove(); openSharePointUpload('${initiativeId}', '${documentType}', '${escapeHtml(initiativeName)}');" style="justify-content:center;background:var(--accent-hover);">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Open in SharePoint
                </button>
                <button class="action-btn" onclick="this.closest('.upload-method-overlay').remove();" style="justify-content:center;background:rgba(255,255,255,0.05);color:var(--text-primary);">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function openDirectUpload(initiativeId, documentType) {
    // Create hidden file input
    let input = document.getElementById('directUploadInput');
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.id = 'directUploadInput';
        input.style.display = 'none';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await uploadDocumentDirectly(file, initiativeId, documentType);
            } catch (err) {
                showToast(err.message, 'error');
            }
            input.value = ''; // Reset
        });
        document.body.appendChild(input);
    }

    input.accept = SHAREPOINT_CONFIG.allowedTypes.join(',');
    input.click();
}

async function deleteDocument(docId, initiativeId, docType) {
    const confirmed = await showConfirmDialog('Are you sure you want to delete this document? This action cannot be undone.');
    if (!confirmed) return;

    setLoading(true);
    try {
        await spClient.deleteDocument(docId);
        showToast('Document deleted successfully', 'success');
        await documentSync.syncDocuments(initiativeId);
    } catch (e) {
        showToast('Failed to delete document: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ============================================================
// CLEANUP ON VIEW CHANGE
// ============================================================

// Override switchView to stop polling when leaving detail view
const originalSwitchView = switchView;
switchView = function(viewId) {
    if (viewId !== 'initiative-detail') {
        documentSync.stopAllPolling();
    }
    return originalSwitchView(viewId);
};

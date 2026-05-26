const API_BASE = 'http://localhost:3005/api';

// Current active persona details (Mock SSO Simulation)
let currentPersona = {
    key: 'requester',
    name: 'Jane Doe',
    email: 'jane.doe@unisa.ac.za',
    unit: 'Academic Affairs',
    role: 'Initiative Requester'
};

// In-Memory fallback cache in case backend is offline
let activeInitiatives = [];
let selectedInitiativeId = null;

// Styled toast notification (replaces native alert)
function showToast(message) {
    const existing = document.querySelector('.toast-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay';
    overlay.innerHTML = `
        <div class="toast-box">
            <div class="toast-icon">📋</div>
            <p>${message}</p>
            <button class="toast-btn" onclick="this.closest('.toast-overlay').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// Cascading Capability mapping dictionary (parsed from UNISA framework)
const capabilityData = {
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

// -------------------------------------------------------------
// LIFE CYCLE INITIALIZER
// -------------------------------------------------------------
window.onload = function() {
    changePersona();
    populateCapTypes();
    loadAllInitiatives();
};

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');

    const items = document.querySelectorAll('.nav-item');
    if (viewId === 'overview') items[0].classList.add('active');
    else if (viewId === 'initiatives-list') items[1].classList.add('active');
    else if (viewId === 'intake-form') items[2].classList.add('active');
    else if (viewId === 'strategic-classification') items[3].classList.add('active');
    else if (viewId === 'steerco-scoring') items[4].classList.add('active');
    else if (viewId === 'reporting') items[5].classList.add('active');

    if (viewId === 'reporting') {
        renderReports();
    }

    if (viewId === 'strategic-classification') {
        renderStrategicClassificationList();
    }

    if (viewId === 'steerco-scoring') {
        renderSteercoScoringList();
    }
}

// -------------------------------------------------------------
// IDENTITY SWITCH MANAGER (Mock SSO)
// -------------------------------------------------------------
function changePersona() {
    const select = document.getElementById('personaSelect');
    const option = select.options[select.selectedIndex];

    currentPersona = {
        key: select.value,
        name: option.getAttribute('data-name'),
        email: option.getAttribute('data-email'),
        unit: option.getAttribute('data-unit'),
        role: option.getAttribute('data-role')
    };

    console.log("SSO Persona switched to:", currentPersona);

    document.getElementById('headerSubtitle').innerText = `Logged in as: ${currentPersona.name} (${currentPersona.role}) | Unit: ${currentPersona.unit}`;

    loadAllInitiatives();
    if (selectedInitiativeId) {
        viewInitiativeDetail(selectedInitiativeId);
    }
}

// Helper to pass mock Entra ID headers with all REST requests
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-role': currentPersona.role,
        'x-email': currentPersona.email,
        'x-name': currentPersona.name,
        'x-unit': currentPersona.unit
    };
}

// -------------------------------------------------------------
// CASCADING CAPABILITY DROPDOWN SELECTORS
// -------------------------------------------------------------
function populateCapTypes() {
    const typeSelect = document.getElementById('formCapType');
    typeSelect.innerHTML = '<option value="">-- Select Capability Type --</option>';
    Object.keys(capabilityData).forEach(type => {
        typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });
}

function populateCapGroups() {
    const type = document.getElementById('formCapType').value;
    const groupSelect = document.getElementById('formCapGroup');
    groupSelect.innerHTML = '<option value="">-- Select Group --</option>';

    if (type && capabilityData[type]) {
        Object.keys(capabilityData[type]).forEach(group => {
            groupSelect.innerHTML += `<option value="${group}">${group}</option>`;
        });
    }
    populateCapTitles();
}

function populateCapTitles() {
    const type = document.getElementById('formCapType').value;
    const group = document.getElementById('formCapGroup').value;
    const titleSelect = document.getElementById('formCapTitle');
    titleSelect.innerHTML = '<option value="">-- Select Title --</option>';

    if (type && group && capabilityData[type][group]) {
        capabilityData[type][group].forEach(title => {
            titleSelect.innerHTML += `<option value="${title}">${title}</option>`;
        });
    }
}

// -------------------------------------------------------------
// BACKEND API COMMUNICATIONS & INBOX FILTER
// -------------------------------------------------------------
async function loadAllInitiatives() {
    try {
        const response = await fetch(`${API_BASE}/initiatives`, { headers: getAuthHeaders() });
        const resData = await response.json();

        if (resData.success) {
            activeInitiatives = resData.data;
        }
    } catch (e) {
        console.warn("Backend API server is offline. Running with fallback local storage state simulation.");
        if (activeInitiatives.length === 0) {
            activeInitiatives = [
                {
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
                }
            ];
        }
    }

    renderOverviewStats();
    renderInboxLists();
}

function renderOverviewStats() {
    document.getElementById('statTotal').innerText = activeInitiatives.length;

    const approved = activeInitiatives.filter(i => i.status === 'Approved').length;
    const declined = activeInitiatives.filter(i => i.status === 'Declined' || i.status === 'Parked').length;

    document.getElementById('statApproved').innerText = approved;
    document.getElementById('statDeclined').innerText = declined;

    const pendingActions = getActionsForRole().length;
    document.getElementById('statPending').innerText = pendingActions;
}

// -------------------------------------------------------------
// GOVERNANCE FILTER MATRIX (Action Items based on role and stage)
// -------------------------------------------------------------
function getActionsForRole() {
    return activeInitiatives.filter(init => {
        if (init.status === 'Declined' || init.status === 'Approved') return false;

        switch (currentPersona.role) {
            case 'Initiative Owner':
                return init.status === 'Submitted' && init.owner_email === currentPersona.email;
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

function renderInboxLists() {
    const inbox = document.getElementById('actionInboxList');
    inbox.innerHTML = '';

    const actions = getActionsForRole();
    if (actions.length === 0) {
        inbox.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary); border: 1px dashed var(--border); border-radius: 12px;">
                All caught up! No active initiatives require action under your "${currentPersona.role}" role.
            </div>`;
    } else {
        actions.forEach(init => {
            inbox.innerHTML += renderInitiativeCard(init);
        });
    }

    const registry = document.getElementById('fullInitiativesList');
    registry.innerHTML = '';
    activeInitiatives.forEach(init => {
        registry.innerHTML += renderInitiativeCard(init);
    });
}

function renderInitiativeCard(init) {
    return `
        <div class="initiative-item" onclick="viewInitiativeDetail('${init.id}')">
            <div class="item-left">
                <span class="badge ${init.status}">${init.status}</span>
                <span class="item-title" style="margin-top: 6px;">${init.name}</span>
                <div class="item-meta">
                    <span>Requester: ${init.requester_name}</span>
                    <span>Unit: ${init.requester_unit}</span>
                    <span>Budget: R ${init.budget_estimate.toLocaleString()}</span>
                </div>
            </div>
            <div>
                <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------
// UC1: INTAKE SUBMISSION
// -------------------------------------------------------------
async function submitIntakeForm(event) {
    event.preventDefault();

    const name = document.getElementById('formName').value;
    const owner_name = document.getElementById('formOwnerName').value;
    const owner_email = document.getElementById('formOwnerEmail').value;
    const background = document.getElementById('formBackground').value;
    const objective = document.getElementById('formObjective').value;
    const potential_benefits = document.getElementById('formBenefits').value;
    const alignment_strategy = document.getElementById('formStrategy').value;
    const capability_type = document.getElementById('formCapType').value;
    const capability_group = document.getElementById('formCapGroup').value;
    const capability_title = document.getElementById('formCapTitle').value;
    const impact_description = document.getElementById('formImpact').value;
    const budget_estimate = document.getElementById('formBudget').value;
    const time_estimate = document.getElementById('formTime').value;
    const affected_parties = document.getElementById('formAffected').value;

    const payload = {
        name, owner_name, owner_email, background, objective, potential_benefits,
        alignment_strategy, capability_type, capability_group, capability_title,
        impact_description, budget_estimate: Number(budget_estimate), time_estimate, affected_parties
    };

    try {
        const response = await fetch(`${API_BASE}/initiatives/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const resData = await response.json();
        showToast(resData.message);

        if (resData.success) {
            document.getElementById('intakeForm').reset();
            loadAllInitiatives();
            switchView('overview');
        }
    } catch (e) {
        const request_number = `IDM-2026-${String(activeInitiatives.length + 1).padStart(4, '0')}`;
        const newInit = {
            id: 'init-' + Math.random().toString(36).substr(2, 9),
            request_number,
            name,
            request_date: new Date().toISOString(),
            requester_email: currentPersona.email,
            requester_name: currentPersona.name,
            requester_unit: currentPersona.unit,
            owner_email,
            owner_name,
            owner_unit: 'Corporate Services',
            background, objective, potential_benefits, alignment_strategy,
            capability_type, capability_group, capability_title,
            impact_description, budget_estimate: Number(budget_estimate), time_estimate, affected_parties,
            status: 'Submitted',
            business_case_status: 'In-Progress',
            solarch_report_status: 'In-Progress'
        };
        activeInitiatives.push(newInit);
        renderOverviewStats();
        renderInboxLists();
        showToast(`Offline Simulation: Registered Initiative with Number: ${request_number}`);
        document.getElementById('intakeForm').reset();
        switchView('overview');
    }
}

// -------------------------------------------------------------
// UC2 - UC7 DETAIL VIEW & GOVERNANCE TRANSITION ENGINE
// -------------------------------------------------------------
async function viewInitiativeDetail(id) {
    selectedInitiativeId = id;
    let initiative = activeInitiatives.find(i => i.id === id);
    if (!initiative) return;

    let history = [];
    try {
        const res = await fetch(`${API_BASE}/initiatives/${id}`, { headers: getAuthHeaders() });
        const resData = await res.json();
        if (resData.success) {
            initiative = resData.data;
            history = resData.history || [];
        }
    } catch(e) {
        history = [
            {
                to_status: initiative.status,
                updated_by_name: initiative.requester_name,
                updated_at: initiative.request_date,
                comments: "Registered and submitted to Nominated Executive Owner."
            }
        ];
    }

    switchView('initiative-detail');

    document.getElementById('detailTitle').innerText = initiative.name;
    document.getElementById('detailMeta').innerText = `${initiative.request_number} | Registered on ${new Date(initiative.request_date).toLocaleDateString()}`;
    document.getElementById('detailBadge').className = `badge ${initiative.status}`;
    document.getElementById('detailBadge').innerText = initiative.status;

    document.getElementById('detailBackground').innerText = initiative.background;
    document.getElementById('detailObjective').innerText = initiative.objective;
    document.getElementById('detailBenefits').innerText = initiative.potential_benefits;
    document.getElementById('detailStrategy').innerText = initiative.alignment_strategy;
    document.getElementById('detailCapCluster').innerText = `${initiative.capability_type} -> ${initiative.capability_group} -> ${initiative.capability_title}`;
    document.getElementById('detailBudget').innerText = `R ${initiative.budget_estimate.toLocaleString()}`;
    document.getElementById('detailTime').innerText = initiative.time_estimate;

    const docs = document.getElementById('detailExtraDocs');
    docs.style.display = 'none';
    if (initiative.status !== 'Submitted' && initiative.status !== 'Accepted') {
        docs.style.display = 'flex';
        document.getElementById('businessCaseLink').innerHTML = `Business Case Status: <strong>${initiative.business_case_status}</strong> <br><small>${initiative.business_case_url || 'https://sharepoint.unisa.local/bc'}</small>`;
        if (initiative.solarch_report_status === 'Completed') {
            document.getElementById('solarchReportLink').innerHTML = `Solutions Architecture Report: <strong>${initiative.solarch_report_status}</strong> <br><small>${initiative.solarch_report_url || 'https://sharepoint.unisa.local/report'}</small>`;
        } else {
            document.getElementById('solarchReportLink').innerHTML = `SolArch Assessment Report: <span style="color:var(--warning)">In-Progress</span>`;
        }
    }

    // Strategic Classification link
    const strategicClassLink = document.getElementById('strategicClassLink');
    strategicClassLink.style.display = 'none';
    if (initiative.strategic_classification) {
        strategicClassLink.style.display = 'block';
        strategicClassLink.innerHTML = `
            <strong>Strategic Classification:</strong>
            Total Score: <strong>${initiative.strategic_classification.total_weighted_score.toFixed(1)}</strong> |
            Category: <strong>${initiative.strategic_classification.category}</strong> |
            Impact: <strong>${initiative.strategic_classification.total_weighted_score < 25 ? 'Minor' : initiative.strategic_classification.total_weighted_score >= 75 ? 'High' : 'Medium'}</strong>
        `;
    }

    // SteerCo Scoring link
    const steercoScoringLink = document.getElementById('steercoScoringLink');
    steercoScoringLink.style.display = 'none';
    if (initiative.steerco_scoring) {
        steercoScoringLink.style.display = 'block';
        const ss = initiative.steerco_scoring;
        steercoScoringLink.innerHTML = `
            <strong>SteerCo Scoring:</strong>
            Value: <strong>${ss.value.toFixed(1)}</strong> |
            Ease: <strong>${ss.ease.toFixed(1)}</strong> |
            Scored: <strong>${new Date(ss.scoring_date).toLocaleDateString()}</strong>
        `;
    }

    // Render historical logs
    const timeline = document.getElementById('detailHistoryTimeline');
    timeline.innerHTML = '';
    history.forEach(h => {
        timeline.innerHTML += `
            <div class="timeline-node">
                <span class="timeline-meta">${new Date(h.updated_at).toLocaleString()}</span>
                <span class="timeline-desc">Changed state to <strong>${h.to_status}</strong> by ${h.updated_by_name}</span>
                <p style="font-size: 0.75rem; color:var(--text-secondary); margin-top:2px;">"${h.comments || 'No remarks recorded'}"</p>
            </div>
        `;
    });

    renderActionWorkstation(initiative);
}

// -------------------------------------------------------------
// DYNAMIC GOVERNANCE PORTLET GENERATOR (Based on Stage & Role)
// -------------------------------------------------------------
function renderActionWorkstation(init) {
    const container = document.getElementById('actionFieldsContainer');
    container.innerHTML = '';

    // Parked state - Unpark for Demand Planner
    if (init.status === 'Parked') {
        if (currentPersona.role === 'Demand Planner') {
            container.innerHTML = `
                <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
                    This initiative is <strong>Parked</strong>. You can unpark it to return to Accepted state.
                </p>
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Unpark Comments</label>
                    <textarea class="form-input" id="unparkComments" placeholder="Reason for unparking..."></textarea>
                </div>
                <button class="action-btn" style="background:var(--success)" onclick="executeTransition('unpark')">Unpark Initiative</button>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">This initiative is <strong>Parked</strong>. Awaiting Demand Planner action.</p>`;
        }
        return;
    }

    // If fully approved or declined, lock action box
    if (init.status === 'Approved' || init.status === 'Declined') {
        container.innerHTML = `<p style="color:var(--text-secondary)">This initiative has concluded in state <strong>${init.status}</strong>. Workstation locked.</p>`;
        return;
    }

    // 1. Nominated Owner Acceptance (UC2)
    if (init.status === 'Submitted') {
        if (currentPersona.role === 'Initiative Owner' && init.owner_email === currentPersona.email) {
            container.innerHTML = `
                <div class="form-group" style="margin-bottom: 12px;">
                    <label>Acceptance Comments / Remarks</label>
                    <textarea class="form-input" id="ownerComments" placeholder="Enter comments here..."></textarea>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="action-btn" style="background:var(--success)" onclick="executeTransition('accept', 'Accept')">Accept Request</button>
                    <button class="action-btn" style="background:var(--danger)" onclick="executeTransition('accept', 'Decline')">Decline</button>
                </div>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting nominated Executive Owner (<strong>${init.owner_name}</strong>) to accept/decline the request.</p>`;
        }
        return;
    }

    // 2. Demand Planner Review & Assignment (UC3)
    if (init.status === 'Accepted') {
        if (currentPersona.role === 'Demand Planner') {
            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Assign Governance Reviewer *</label>
                    <select class="form-input" id="assignReviewer">
                        <option value="dev.arch@unisa.ac.za|Dev Solutions">Dev Solutions (Enterprise Architecture)</option>
                        <option value="jane.doe@unisa.ac.za|Jane Doe">Jane Doe (Academic Affairs)</option>
                    </select>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="action-btn" onclick="executeTransition('assign', 'Assign')">Assign & Set Reviewed</button>
                    <button class="action-btn" style="background:var(--warning)" onclick="executeTransition('assign', 'Park')">Park Initiative</button>
                </div>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting Demand Planner to assign a governance Reviewer.</p>`;
        }
        return;
    }

    // 3. Reviewer Meeting, Impact Class & Business Case Upload (UC4)
    if (init.status === 'Reviewed') {
        if (currentPersona.role === 'Solutions Architect' || currentPersona.role === 'Demand Planner') {
            const sc = init.strategic_classification;
            const derivedImpact = !sc ? 'Not yet classified' :
                sc.total_weighted_score < 25 ? 'Minor' :
                sc.total_weighted_score >= 75 ? 'High' : 'Medium';

            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Derived Strategic Impact (from Classification)</label>
                    <input type="text" class="form-input" value="${derivedImpact}" readonly style="font-weight:600;color:var(--accent);">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Business Case Document Status *</label>
                    <select class="form-input" id="reviewBcStatus">
                        <option value="In-Progress">In-Progress (Draft)</option>
                        <option value="Signed-Fully">Signed-Fully (Uploaded to SharePoint)</option>
                    </select>
                </div>
                <button class="action-btn" onclick="executeTransition('review')">Submit Review</button>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting Solutions Architect / Reviewer to classify initiative and upload Business Case.</p>`;
        }
        return;
    }

    // 4. Solutions Architecture Assessment (UC5)
    if (init.status === 'SolArch') {
        if (currentPersona.role === 'Solutions Architect') {
            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>SolArch Assessment Report Status *</label>
                    <select class="form-input" id="assessReportStatus">
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed (Uploaded to SharePoint)</option>
                    </select>
                </div>
                <button class="action-btn" onclick="executeTransition('assess')">Submit Assessment</button>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting Enterprise Architect to assess and upload SolArch report.</p>`;
        }
        return;
    }

    // 5. Solutions Architecture Committee Recommendation (UC6)
    if (init.status === 'Assessed') {
        if (currentPersona.role === 'ICT SteerCo Secretariat' || currentPersona.role === 'Solutions Architect') {
            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Committee Meeting Recommendation *</label>
                    <select class="form-input" id="recommendDecision">
                        <option value="Recommended">Recommended (To ICT SteerCo)</option>
                        <option value="Declined">Declined</option>
                        <option value="Referred Back">Referred Back to Owner</option>
                    </select>
                </div>
                <button class="action-btn" onclick="executeTransition('recommend')">Record Recommendation</button>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting Secretariat to register SolArch meeting decision.</p>`;
        }
        return;
    }

    // 6. ICT SteerCo Secretariat Approval (UC7)
    if (init.status === 'Recommended') {
        if (currentPersona.role === 'ICT SteerCo Secretariat') {
            let valueBadge = '';
            let easeBadge = '';
            if (init.steerco_scoring) {
                const v = init.steerco_scoring.value;
                const e = init.steerco_scoring.ease;
                const vColor = v >= 15 ? 'var(--success)' : v >= 10 ? 'var(--warning)' : 'var(--danger)';
                const eColor = e >= 30 ? 'var(--success)' : e >= 20 ? 'var(--warning)' : 'var(--danger)';
                valueBadge = `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${vColor}20;color:${vColor};font-weight:600;font-size:0.85rem;">Value: ${v.toFixed(1)}</span>`;
                easeBadge = `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${eColor}20;color:${eColor};font-weight:600;font-size:0.85rem;">Ease: ${e.toFixed(1)}</span>`;
            } else {
                valueBadge = `<span style="color:var(--text-secondary);font-size:0.85rem;">Value: Not scored yet</span>`;
                easeBadge = `<span style="color:var(--text-secondary);font-size:0.85rem;">Ease: Not scored yet</span>`;
            }

            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>SteerCo Final Decision *</label>
                    <select class="form-input" id="steercoDecision">
                        <option value="Approved">Approved as Project</option>
                        <option value="Declined">Declined</option>
                        <option value="Referred Back">Referred Back to Owner</option>
                    </select>
                </div>
                <div style="display:flex;gap:12px;margin-bottom:12px;">
                    ${valueBadge}
                    ${easeBadge}
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Approval Comments</label>
                    <textarea class="form-input" id="approveComments" placeholder="Enter any remarks..."></textarea>
                </div>
                <button class="action-btn" onclick="executeTransition('approve')">Submit Decision</button>
            `;
        } else {
            container.innerHTML = `<p style="color:var(--text-secondary)">Awaiting ICT SteerCo Committee Secretariat to record final project approval decision.</p>`;
        }
        return;
    }
}

// -------------------------------------------------------------
// WORKFLOW STATE MACHINE TRANSITION ENGINES
// -------------------------------------------------------------
async function executeTransition(actionType, extraArg) {
    const id = selectedInitiativeId;
    let url = `${API_BASE}/initiatives/${id}/${actionType}`;
    let payload = {};

    if (actionType === 'accept') {
        payload = {
            action: extraArg,
            comments: document.getElementById('ownerComments').value
        };
    } else if (actionType === 'assign') {
        if (extraArg === 'Park') {
            payload = { action: 'Park' };
        } else {
            const selectVal = document.getElementById('assignReviewer').value.split('|');
            payload = {
                reviewer_email: selectVal[0],
                reviewer_name: selectVal[1],
                action: 'Assign'
            };
        }
    } else if (actionType === 'review') {
        payload = {
            business_case_status: document.getElementById('reviewBcStatus').value,
            initiative_impact_class: document.getElementById('reviewImpact')?.value || 'Medium'
        };
    } else if (actionType === 'assess') {
        payload = {
            solarch_report_status: document.getElementById('assessReportStatus').value
        };
    } else if (actionType === 'recommend') {
        payload = {
            recommendation: document.getElementById('recommendDecision').value
        };
    } else if (actionType === 'approve') {
        payload = {
            approval_action: document.getElementById('steercoDecision').value,
            comments: document.getElementById('approveComments')?.value || ''
        };
    } else if (actionType === 'classify') {
        payload = {
            scores: window._pendingSCScores || {},
            total_weighted_score: parseFloat(document.getElementById('scTotalCell')?.innerText || '0'),
            category: document.getElementById('scCategoryCell')?.innerText || 'Not Classified'
        };
    } else if (actionType === 'steerco-scoring') {
        payload = {
            dimensions: window._pendingSteercoScores || {}
        };
    } else if (actionType === 'unpark') {
        payload = {
            comments: document.getElementById('unparkComments')?.value || ''
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const resData = await response.json();
        showToast(resData.message);

        if (resData.success) {
            loadAllInitiatives();
            setTimeout(() => {
                viewInitiativeDetail(id);
            }, 300);
        }
    } catch (e) {
        showToast("Simulating workflow state update locally...");
        const idx = activeInitiatives.findIndex(i => i.id === id);
        if (idx !== -1) {
            const target = activeInitiatives[idx];
            if (actionType === 'accept') {
                target.status = extraArg === 'Accept' ? 'Accepted' : 'Declined';
                target.decline_reason = extraArg === 'Decline' ? payload.comments : undefined;
            } else if (actionType === 'assign') {
                target.status = extraArg === 'Park' ? 'Parked' : 'Reviewed';
                if (payload.reviewer_name) {
                    target.reviewer_name = payload.reviewer_name;
                    target.reviewer_email = payload.reviewer_email;
                }
            } else if (actionType === 'review') {
                target.business_case_status = payload.business_case_status;
                target.status = payload.business_case_status === 'Signed-Fully' ? 'SolArch' : 'Reviewed';
            } else if (actionType === 'assess') {
                target.solarch_report_status = payload.solarch_report_status;
                target.status = payload.solarch_report_status === 'Completed' ? 'Assessed' : 'SolArch';
            } else if (actionType === 'recommend') {
                target.status = payload.recommendation;
            } else if (actionType === 'approve') {
                target.status = payload.approval_action;
            } else if (actionType === 'classify') {
                target.strategic_classification = {
                    scores: payload.scores,
                    total_weighted_score: payload.total_weighted_score,
                    category: payload.category
                };
            } else if (actionType === 'steerco-scoring') {
                target.steerco_scoring = payload.dimensions;
            } else if (actionType === 'unpark') {
                target.status = 'Accepted';
            }

            activeInitiatives[idx] = target;
            renderOverviewStats();
            renderInboxLists();
            setTimeout(() => {
                viewInitiativeDetail(id);
            }, 300);
        }
    }
}

// -------------------------------------------------------------
// STRATEGIC CLASSIFICATION ENGINE
// -------------------------------------------------------------
function renderStrategicClassificationList() {
    const container = document.getElementById('strategicClassifictionInitiativesList');
    const matrix = document.getElementById('strategicClassificationMatrix');
    matrix.style.display = 'none';
    container.innerHTML = '';

    const eligible = activeInitiatives.filter(i =>
        i.status !== 'Submitted' && i.status !== 'Draft' && i.status !== 'Declined'
    );

    if (eligible.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);padding:20px;">No initiatives available for classification.</p>`;
        return;
    }

    eligible.forEach(init => {
        const classified = init.strategic_classification ? ' (Classified)' : '';
        container.innerHTML += `
            <div class="initiative-item" onclick="classifyInitiative('${init.id}')">
                <div class="item-left">
                    <span class="badge ${init.status}">${init.status}</span>
                    <span class="item-title" style="margin-top:6px;">${init.name}${classified}</span>
                </div>
                <div>
                    <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </div>
            </div>
        `;
    });
}

function classifyInitiative(id) {
    selectedInitiativeId = id;
    const initiative = activeInitiatives.find(i => i.id === id);
    if (!initiative) return;

    switchView('strategic-classification');

    const matrix = document.getElementById('strategicClassificationMatrix');
    matrix.style.display = 'block';

    const pillars = [
        { name: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching", weight: 15 },
        { name: "Pillar 2: Propel Research Innovation", weight: 15 },
        { name: "Pillar 3: Pivot Engaged Scholarship and Global Impact", weight: 15 },
        { name: "Pillar 4: Strengthen Student Support Services", weight: 15 },
        { name: "Pillar 5: Resourcing our Futures", weight: 15 },
        { name: "Enabler 1: People", weight: 5 },
        { name: "Enabler 2: Digitalization and Digitization", weight: 5 },
        { name: "Enabler 3: Governance, Reporting and Management Systems", weight: 5 },
        { name: "Enabler 4: Financial Sustainability", weight: 5 },
        { name: "Enabler 5: Infrastructure and Operations", weight: 5 }
    ];

    const saved = initiative.strategic_classification?.scores || {};
    window._pendingSCScores = { ...saved };

    let html = `
        <h3 style="margin-bottom:8px;">Strategic Classification Matrix</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px;">
            Scoring: <strong>${initiative.name}</strong>
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

    pillars.forEach((pillar, i) => {
        const savedScore = saved[pillar.name] || 0;
        const weighted = (savedScore * pillar.weight / 10).toFixed(1);
        html += `
            <tr>
                <td>${pillar.name}</td>
                <td>${pillar.weight}</td>
                <td>
                    <select class="sc-score-select" data-pillar="${pillar.name}" onchange="updateSCScore('${id}', this)">
                        ${[0,1,2,3,4,5].map(s => `<option value="${s}" ${s === savedScore ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td id="w_${i}">${weighted}</td>
            </tr>
        `;
    });

    let total = 0;
    pillars.forEach((p, i) => {
        const sc = saved[p.name] || 0;
        total += sc * p.weight / 10;
    });
    const cat = total < 25 ? 'Minor' : total >= 75 ? 'High' : 'Medium';

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Total Weighted Score</strong></td>
                    <td></td>
                    <td></td>
                    <td id="scTotalCell">${total.toFixed(1)}</td>
                </tr>
                <tr>
                    <td><strong>Classification</strong></td>
                    <td></td>
                    <td></td>
                    <td id="scCategoryCell">${cat}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;">
            <button class="action-btn" onclick="submitStrategicClassification('${id}')">Save Classification</button>
        </div>
    `;

    matrix.innerHTML = html;
}

function updateSCScore(id, select) {
    const pillar = select.getAttribute('data-pillar');
    const score = parseInt(select.value);
    window._pendingSCScores[pillar] = score;

    const pillars = [
        { name: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching", weight: 15 },
        { name: "Pillar 2: Propel Research Innovation", weight: 15 },
        { name: "Pillar 3: Pivot Engaged Scholarship and Global Impact", weight: 15 },
        { name: "Pillar 4: Strengthen Student Support Services", weight: 15 },
        { name: "Pillar 5: Resourcing our Futures", weight: 15 },
        { name: "Enabler 1: People", weight: 5 },
        { name: "Enabler 2: Digitalization and Digitization", weight: 5 },
        { name: "Enabler 3: Governance, Reporting and Management Systems", weight: 5 },
        { name: "Enabler 4: Financial Sustainability", weight: 5 },
        { name: "Enabler 5: Infrastructure and Operations", weight: 5 }
    ];

    let total = 0;
    pillars.forEach((p, i) => {
        const s = window._pendingSCScores[p.name] || 0;
        const weighted = s * p.weight / 10;
        total += weighted;
        const cell = document.getElementById(`w_${i}`);
        if (cell) cell.innerText = weighted.toFixed(1);
    });

    const cat = total < 25 ? 'Minor' : total >= 75 ? 'High' : 'Medium';
    document.getElementById('scTotalCell').innerText = total.toFixed(1);
    document.getElementById('scCategoryCell').innerText = cat;
}

async function submitStrategicClassification(id) {
    const scores = window._pendingSCScores || {};

    const pillars = [
        { name: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching", weight: 15 },
        { name: "Pillar 2: Propel Research Innovation", weight: 15 },
        { name: "Pillar 3: Pivot Engaged Scholarship and Global Impact", weight: 15 },
        { name: "Pillar 4: Strengthen Student Support Services", weight: 15 },
        { name: "Pillar 5: Resourcing our Futures", weight: 15 },
        { name: "Enabler 1: People", weight: 5 },
        { name: "Enabler 2: Digitalization and Digitization", weight: 5 },
        { name: "Enabler 3: Governance, Reporting and Management Systems", weight: 5 },
        { name: "Enabler 4: Financial Sustainability", weight: 5 },
        { name: "Enabler 5: Infrastructure and Operations", weight: 5 }
    ];

    let total = 0;
    pillars.forEach(p => {
        const s = scores[p.name] || 0;
        total += s * p.weight / 10;
    });
    const category = total < 25 ? 'Minor' : total >= 75 ? 'High' : 'Medium';

    try {
        const response = await fetch(`${API_BASE}/initiatives/${id}/strategic-classification`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ scores, total_weighted_score: total, category })
        });
        const resData = await response.json();
        showToast(resData.message);
        if (resData.success) {
            loadAllInitiatives();
            renderStrategicClassificationList();
        }
    } catch (e) {
        showToast("Offline: Classification saved locally.");
        const idx = activeInitiatives.findIndex(i => i.id === id);
        if (idx !== -1) {
            activeInitiatives[idx].strategic_classification = { scores, total_weighted_score: total, category };
        }
    }
}

// -------------------------------------------------------------
// STEERCO VALUE & EASE SCORING ENGINE
// -------------------------------------------------------------
function renderSteercoScoringList() {
    const container = document.getElementById('steercoScoringInitiativesList');
    const matrix = document.getElementById('steercoScoringMatrix');
    matrix.style.display = 'none';
    container.innerHTML = '';

    const eligible = activeInitiatives.filter(i =>
        i.strategic_classification && i.status !== 'Submitted' && i.status !== 'Draft' && i.status !== 'Declined'
    );

    if (eligible.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);padding:20px;">No initiatives with Strategic Classification available for SteerCo scoring.</p>`;
        return;
    }

    eligible.forEach(init => {
        const scored = init.steerco_scoring ? ' (Scored)' : '';
        container.innerHTML += `
            <div class="initiative-item" onclick="calculateSteercoScore('${init.id}')">
                <div class="item-left">
                    <span class="badge ${init.status}">${init.status}</span>
                    <span class="item-title" style="margin-top:6px;">${init.name}${scored}</span>
                </div>
                <div>
                    <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </div>
            </div>
        `;
    });
}

function calculateSteercoScore(id) {
    selectedInitiativeId = id;
    const initiative = activeInitiatives.find(i => i.id === id);
    if (!initiative) return;

    switchView('steerco-scoring');

    const matrix = document.getElementById('steercoScoringMatrix');
    matrix.style.display = 'block';

    // Auto-derive SC numeric score
    const sc = initiative.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const saved = initiative.steerco_scoring?.dimensions || {};
    window._pendingSteercoScores = {
        ict_demand: saved.ict_demand || 5,
        effort: saved.effort || 5,
        system_readiness: scNumeric,
        cost: saved.cost || 5,
        likelihood_success: saved.likelihood_success || 5,
        resources: saved.resources || 5
    };

    const dimensions = [
        { key: 'ict_demand', label: 'Type of ICT Demand', desc: 'Complexity of the ICT demand' },
        { key: 'effort', label: 'Effort', desc: 'Estimated effort required' },
        { key: 'system_readiness', label: 'System Readiness', desc: 'Auto-derived from Strategic Classification' },
        { key: 'cost', label: 'Cost', desc: 'Financial cost impact' },
        { key: 'likelihood_success', label: 'Likelihood of Success', desc: 'Probability of successful delivery' },
        { key: 'resources', label: 'Resources', desc: 'Resource availability' }
    ];

    const scoreLabels = ['Minimal (1)', 'Low (3)', 'Medium (5)', 'High (8)', 'Very High (10)'];
    const scoreValues = [1, 3, 5, 8, 10];

    let html = `
        <h3 style="margin-bottom:8px;">SteerCo Value & Ease Scoring Matrix</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px;">
            Scoring: <strong>${initiative.name}</strong> | SC Score: <strong>${scNumeric}</strong>
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

    dimensions.forEach(dim => {
        const val = window._pendingSteercoScores[dim.key];
        const idx = scoreValues.indexOf(val);
        const selectedIdx = idx >= 0 ? idx : 2;

        html += `
            <tr>
                <td><strong>${dim.label}</strong></td>
                <td style="font-size:0.85rem;color:var(--text-secondary);">${dim.desc}</td>
                <td>
                    <select class="sc-score-select" onchange="updateSteercoScore('${dim.key}', this.value)">
                        ${scoreLabels.map((label, i) =>
                            `<option value="${scoreValues[i]}" ${i === selectedIdx ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </td>
            </tr>
        `;
    });

    const value = scNumeric + (window._pendingSteercoScores.ict_demand || 5);
    const sumEase = ['effort', 'system_readiness', 'cost', 'likelihood_success', 'resources']
        .reduce((sum, k) => sum + (window._pendingSteercoScores[k] || 0), 0);

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>Value (SC + ICT Demand)</strong></td>
                    <td></td>
                    <td id="steercoValueCell">${value.toFixed(1)}</td>
                </tr>
                <tr>
                    <td><strong>Ease (Sum of 5 dimensions)</strong></td>
                    <td></td>
                    <td id="steercoEaseCell">${sumEase.toFixed(1)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;">
            <button class="action-btn" onclick="submitSteercoScoring('${id}')">Save SteerCo Scores</button>
        </div>
    `;

    matrix.innerHTML = html;
}

function updateSteercoScore(key, value) {
    window._pendingSteercoScores[key] = parseInt(value);

    const initiative = activeInitiatives.find(i => i.id === selectedInitiativeId);
    const sc = initiative?.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const valueScore = scNumeric + (window._pendingSteercoScores.ict_demand || 5);
    const sumEase = ['effort', 'system_readiness', 'cost', 'likelihood_success', 'resources']
        .reduce((sum, k) => sum + (window._pendingSteercoScores[k] || 0), 0);

    document.getElementById('steercoValueCell').innerText = valueScore.toFixed(1);
    document.getElementById('steercoEaseCell').innerText = sumEase.toFixed(1);
}

async function submitSteercoScoring(id) {
    const sc = activeInitiatives.find(i => i.id === id)?.strategic_classification;
    let scNumeric = 5;
    if (sc) {
        if (sc.total_weighted_score >= 75) scNumeric = 10;
        else if (sc.total_weighted_score >= 25) scNumeric = 5;
        else scNumeric = 1;
    }

    const payload = {
        strategic_classification_score: scNumeric,
        ict_demand: window._pendingSteercoScores.ict_demand || 5,
        effort: window._pendingSteercoScores.effort || 5,
        system_readiness: window._pendingSteercoScores.system_readiness || scNumeric,
        cost: window._pendingSteercoScores.cost || 5,
        likelihood_success: window._pendingSteercoScores.likelihood_success || 5,
        resources: window._pendingSteercoScores.resources || 5
    };

    try {
        const response = await fetch(`${API_BASE}/initiatives/${id}/steerco-scoring`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const resData = await response.json();
        showToast(resData.message);
        if (resData.success) {
            loadAllInitiatives();
            renderSteercoScoringList();
        }
    } catch (e) {
        const value = scNumeric + payload.ict_demand;
        const ease = ['effort', 'system_readiness', 'cost', 'likelihood_success', 'resources']
            .reduce((sum, k) => sum + payload[k], 0);

        showToast("Offline: SteerCo scores saved locally.");
        const idx = activeInitiatives.findIndex(i => i.id === id);
        if (idx !== -1) {
            activeInitiatives[idx].steerco_scoring = {
                value,
                ease,
                dimensions: payload,
                scoring_date: new Date().toISOString()
            };
        }
    }
}

// -------------------------------------------------------------
// UC8: EXECUTIVE REPORTING ENGINE (Power BI Simulator)
// -------------------------------------------------------------
function renderReports() {
    const tableBody = document.querySelector('#reportTable tbody');
    tableBody.innerHTML = '';

    let totalVal = 0;
    activeInitiatives.forEach(init => {
        totalVal += init.budget_estimate;
        tableBody.innerHTML += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px; font-weight:600;">${init.request_number}</td>
                <td style="padding: 12px;">${init.name}</td>
                <td style="padding: 12px;">${init.requester_name}</td>
                <td style="padding: 12px; font-size:0.8rem; color:var(--text-secondary);">${init.alignment_strategy.split(':')[0]}</td>
                <td style="padding: 12px;"><span class="badge ${init.status}">${init.status}</span></td>
                <td style="padding: 12px; font-weight:600; text-align:right;">R ${init.budget_estimate.toLocaleString()}</td>
            </tr>
        `;
    });

    document.getElementById('reportValue').innerText = `R ${totalVal.toLocaleString()}`;
}

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

// Cascading Capability mapping dictionary (parsed from UNISA framework)
const capabilityData = {
    "Learning & Teaching": {
        "Curriculum Management": ["Curriculum Planning", "Curriculum Design", "Curriculum Production", "Curriculum Accreditation", "Offering Management", "Curriculum Improvement"],
        "Student Admission": ["Study Application Management", "Learning Recognition Management", "Matriculation"],
        "Student Enrolment": ["Enrolment", "Student Allocation", "Timetable Management"]
    },
    "Research": {
        "Research Opportunities & Planning": ["Research Opportunity Management", "Collaborative Opportunity Management", "Research Project Design"],
        "Research Funding": ["Research Fund Sourcing", "Research Grant Management"],
        "Research Assurance": ["Research Ethics Management", "Research Integrity Management"]
    },
    "Enabling": {
        "Strategy Management": ["Vision & Strategy Development", "Strategic Plan Management", "Business Capability Management", "Business Planning"],
        "Governance, Risk, & Compliance": ["Policy Management", "Quality Management", "Risk Management", "Compliance Management"],
        "Human Resource Management": ["Workforce Planning", "Talent Acquisition", "Human Resource Support"],
        "Financial Management": ["Financial Planning & Analysis", "Accounts Payable", "Asset Management"]
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

    // Highlight sidebar
    const items = document.querySelectorAll('.nav-item');
    if (viewId === 'overview') items[0].classList.add('active');
    else if (viewId === 'initiatives-list') items[1].classList.add('active');
    else if (viewId === 'intake-form') items[2].classList.add('active');
    else if (viewId === 'reporting') items[3].classList.add('active');

    if (viewId === 'reporting') {
        renderReports();
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
        // Fallback static data if express is starting up
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

    // Awaiting governance actions
    const pendingActions = getActionsForRole().length;
    document.getElementById('statPending').innerText = pendingActions;
}

// -------------------------------------------------------------
// GOVERNANCE FILTER MATRIX (Action Items based on role and stage)
// -------------------------------------------------------------
function getActionsForRole() {
    return activeInitiatives.filter(init => {
        if (init.status === 'Declined' || init.status === 'Approved' || init.status === 'Parked') return false;

        switch (currentPersona.role) {
            case 'Initiative Owner':
                return init.status === 'Submitted' && init.owner_email === currentPersona.email;
            case 'Demand Planner':
                return init.status === 'Accepted';
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
                🎉 All caught up! No active initiatives require action under your "${currentPersona.role}" role.
            </div>`;
    } else {
        actions.forEach(init => {
            inbox.innerHTML += renderInitiativeCard(init);
        });
    }

    // Render registry tab
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
                    <span>👤 Requester: ${init.requester_name}</span>
                    <span>🏢 Unit: ${init.requester_unit}</span>
                    <span>💰 Budget: R ${init.budget_estimate.toLocaleString()}</span>
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
        alert(resData.message);
        
        if (resData.success) {
            document.getElementById('intakeForm').reset();
            loadAllInitiatives();
            switchView('overview');
        }
    } catch (e) {
        // Local state simulation backup
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
        alert(`Offline Simulation: Registered Initiative with Number: ${request_number}`);
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

    // Try fetching live history log
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
    
    // Bind main details
    document.getElementById('detailTitle').innerText = initiative.name;
    document.getElementById('detailMeta').innerText = `${initiative.request_number} | Registered on ${new Date(initiative.request_date).toLocaleDateString()}`;
    document.getElementById('detailBadge').className = `badge ${initiative.status}`;
    document.getElementById('detailBadge').innerText = initiative.status;
    
    document.getElementById('detailBackground').innerText = initiative.background;
    document.getElementById('detailObjective').innerText = initiative.objective;
    document.getElementById('detailBenefits').innerText = initiative.potential_benefits;
    document.getElementById('detailStrategy').innerText = initiative.alignment_strategy;
    document.getElementById('detailCapCluster').innerText = `${initiative.capability_type} → ${initiative.capability_group} → ${initiative.capability_title}`;
    document.getElementById('detailBudget').innerText = `R ${initiative.budget_estimate.toLocaleString()}`;
    document.getElementById('detailTime').innerText = initiative.time_estimate;

    // Show files if uploaded
    const docs = document.getElementById('detailExtraDocs');
    docs.style.display = 'none';
    if (initiative.status !== 'Submitted' && initiative.status !== 'Accepted') {
        docs.style.display = 'flex';
        document.getElementById('businessCaseLink').innerHTML = `🔗 Business Case Status: <strong>${initiative.business_case_status}</strong> <br><small>${initiative.business_case_url || 'https://sharepoint.unisa.local/bc'}</small>`;
        if (initiative.solarch_report_status === 'Completed') {
            document.getElementById('solarchReportLink').innerHTML = `🔗 Solutions Architecture Report: <strong>${initiative.solarch_report_status}</strong> <br><small>${initiative.solarch_report_url || 'https://sharepoint.unisa.local/report'}</small>`;
        } else {
            document.getElementById('solarchReportLink').innerHTML = `📂 SolArch Assessment Report: <span style="color:var(--warning)">In-Progress</span>`;
        }
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

    // If fully approved or declined, lock action box
    if (init.status === 'Approved' || init.status === 'Declined' || init.status === 'Parked') {
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
            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Initiative Impact Classification *</label>
                    <select class="form-input" id="reviewImpact">
                        <option value="Small (Minor)">Small (Minor)</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
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

    // 6. ICT SteerCo Secretariat Approval & Prioritization Rating (UC7)
    if (init.status === 'Recommended') {
        if (currentPersona.role === 'ICT SteerCo Secretariat') {
            container.innerHTML = `
                <div class="form-group" style="margin-bottom:12px;">
                    <label>SteerCo Final Decision *</label>
                    <select class="form-input" id="steercoDecision">
                        <option value="Approved">Approved as Project</option>
                        <option value="Declined">Declined</option>
                        <option value="Referred Back">Referred Back to Owner</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Project Rating Class *</label>
                    <select class="form-input" id="steercoRating">
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label>Weighted Prioritisation Score (1-100) *</label>
                    <input type="number" class="form-input" id="steercoScore" value="75" min="1" max="100">
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

    // Build payload according to endpoint specs
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
            initiative_impact_class: document.getElementById('reviewImpact').value
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
            project_rating: document.getElementById('steercoRating').value,
            project_priority_score: Number(document.getElementById('steercoScore').value)
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const resData = await response.json();
        alert(resData.message);
        
        if (resData.success) {
            loadAllInitiatives();
            setTimeout(() => {
                viewInitiativeDetail(id);
            }, 300);
        }
    } catch (e) {
        // Offline Fallback simulation engine
        alert("Simulating workflow state update locally...");
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
                target.initiative_impact_class = payload.initiative_impact_class;
                target.status = payload.business_case_status === 'Signed-Fully' ? 'SolArch' : 'Reviewed';
            } else if (actionType === 'assess') {
                target.solarch_report_status = payload.solarch_report_status;
                target.status = payload.solarch_report_status === 'Completed' ? 'Assessed' : 'SolArch';
            } else if (actionType === 'recommend') {
                target.status = payload.recommendation;
            } else if (actionType === 'approve') {
                target.status = payload.approval_action;
                target.project_priority_score = payload.project_priority_score;
                target.project_rating = payload.project_rating;
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbService_1 = require("../services/dbService");
const webhookService_1 = require("../services/webhookService");
const authMiddleware_1 = require("./authMiddleware");
const router = (0, express_1.Router)();
// Apply mock authorization middleware across all governance routes
router.use(authMiddleware_1.mockAuthMiddleware);
// Helper for generating sequential request numbers (UC1)
const generateRequestNumber = () => {
    const year = new Date().getFullYear();
    const count = dbService_1.DbService.getInitiatives().length + 1;
    return `IDM-${year}-${String(count).padStart(4, '0')}`;
};
// -------------------------------------------------------------
// GET /initiatives - LIST ALL INITIATIVES (UC8 Reporting)
// -------------------------------------------------------------
router.get('/', (req, res) => {
    try {
        const initiatives = dbService_1.DbService.getInitiatives();
        res.json({ success: true, count: initiatives.length, data: initiatives });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /initiatives/:id - GET SINGLE INITIATIVE DETAILS
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const history = dbService_1.DbService.getHistoryForInitiative(id);
        res.json({ success: true, data: initiative, history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC1: REGISTER INITIATIVE REQUEST
// -------------------------------------------------------------
router.post('/register', (req, res) => {
    try {
        const user = req.user;
        const { name, owner_name, owner_email, background, objective, potential_benefits, alignment_strategy, capability_type, capability_group, capability_title, impact_description, budget_estimate, affected_parties, time_estimate } = req.body;
        // Business Rule validation per requirements (UC1 Exceptional Flows)
        if (!name || !owner_name || !owner_email || !background || !objective ||
            !potential_benefits || !alignment_strategy || !capability_type ||
            !capability_group || !capability_title || !impact_description ||
            budget_estimate === undefined || !affected_parties || !time_estimate) {
            return res.status(400).json({
                success: false,
                message: "Kindly complete all the fields"
            });
        }
        // Simulate search for UNISA email address domains
        if (!owner_email.endsWith('@unisa.ac.za')) {
            return res.status(400).json({
                success: false,
                message: "The Initiative Owner cannot be found"
            });
        }
        const request_number = generateRequestNumber();
        const newInitiative = {
            request_number,
            name,
            request_date: new Date().toISOString(),
            requester_email: user.email,
            requester_name: user.name,
            requester_unit: user.unit,
            owner_email,
            owner_name,
            owner_unit: "Corporate Services Portfolio",
            background,
            objective,
            potential_benefits,
            alignment_strategy,
            capability_type,
            capability_group,
            capability_title,
            impact_description,
            budget_estimate: Number(budget_estimate),
            affected_parties,
            time_estimate,
            status: "Submitted",
            business_case_status: "In-Progress",
            solarch_report_status: "In-Progress"
        };
        const saved = dbService_1.DbService.addInitiative(newInitiative);
        // Record history log for audit tracking
        dbService_1.DbService.addHistory({
            initiative_id: saved.id,
            from_status: "Draft",
            to_status: "Submitted",
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: "Initiative successfully registered."
        });
        // Trigger Power Automate & M365 channels
        webhookService_1.WebhookService.triggerPowerAutomate("Registration Submission", saved);
        res.status(201).json({
            success: true,
            message: `Initiative registered successfully with Request Number: ${request_number}`,
            data: saved
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC2: ACCEPT INITIATIVE REQUEST
// -------------------------------------------------------------
router.post('/:id/accept', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { action, comments } = req.body; // 'Accept' | 'Decline'
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const originalStatus = initiative.status;
        if (action === 'Accept') {
            const updated = dbService_1.DbService.updateInitiative(id, {
                status: 'Accepted',
                acceptance_date: new Date().toISOString()
            });
            dbService_1.DbService.addHistory({
                initiative_id: id,
                from_status: originalStatus,
                to_status: 'Accepted',
                updated_by_email: user.email,
                updated_by_name: user.name,
                comments: comments || "Initiative request accepted by nominated Owner."
            });
            webhookService_1.WebhookService.triggerPowerAutomate("Owner Acceptance", updated, comments);
            return res.json({
                success: true,
                message: "Initiative accepted and assigned to Demand Planner.",
                data: updated
            });
        }
        else if (action === 'Decline') {
            const updated = dbService_1.DbService.updateInitiative(id, {
                status: 'Declined',
                decline_reason: comments || 'Declined by owner'
            });
            dbService_1.DbService.addHistory({
                initiative_id: id,
                from_status: originalStatus,
                to_status: 'Declined',
                updated_by_email: user.email,
                updated_by_name: user.name,
                comments: comments || "Initiative declined."
            });
            webhookService_1.WebhookService.triggerPowerAutomate("Owner Decline", updated, comments);
            return res.json({
                success: true,
                message: "This Initiative will not continue any further",
                data: updated
            });
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid action. Use 'Accept' or 'Decline'." });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC3: ASSIGN AN ACCEPTED INITIATIVE REQUEST TO A REVIEWER
// -------------------------------------------------------------
router.post('/:id/assign', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { reviewer_email, reviewer_name, action } = req.body; // action can also be 'Park'
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const originalStatus = initiative.status;
        if (action === 'Park') {
            const updated = dbService_1.DbService.updateInitiative(id, {
                status: 'Parked'
            });
            dbService_1.DbService.addHistory({
                initiative_id: id,
                from_status: originalStatus,
                to_status: 'Parked',
                updated_by_email: user.email,
                updated_by_name: user.name,
                comments: "Initiative has been parked by Demand Planner."
            });
            webhookService_1.WebhookService.triggerPowerAutomate("Demand Planner Parked", updated);
            return res.json({ success: true, message: "Initiative status set to Parked.", data: updated });
        }
        if (!reviewer_email || !reviewer_name) {
            return res.status(400).json({ success: false, message: "Reviewer name and email are mandatory for assignment." });
        }
        const updated = dbService_1.DbService.updateInitiative(id, {
            status: 'Reviewed',
            reviewer_email,
            reviewer_name
        });
        dbService_1.DbService.addHistory({
            initiative_id: id,
            from_status: originalStatus,
            to_status: 'Reviewed',
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: `Assigned to Reviewer: ${reviewer_name}`
        });
        webhookService_1.WebhookService.triggerPowerAutomate("Assigned to Reviewer", updated);
        res.json({ success: true, message: "Initiative assigned successfully.", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC4: REVIEW AN INITIATIVE REQUEST
// -------------------------------------------------------------
router.post('/:id/review', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { business_case_status, business_case_url, initiative_impact_class } = req.body;
        if (!business_case_status || !initiative_impact_class) {
            return res.status(400).json({ success: false, message: "Business Case status and impact classification are mandatory." });
        }
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const nextStatus = business_case_status === 'Signed-Fully' ? 'SolArch' : 'Reviewed';
        const updated = dbService_1.DbService.updateInitiative(id, {
            business_case_status,
            business_case_url: business_case_url || "https://sharepoint.unisa.local/sites/idm/business-cases/" + initiative.request_number + ".docx",
            initiative_impact_class,
            status: nextStatus,
            review_date: new Date().toISOString()
        });
        dbService_1.DbService.addHistory({
            initiative_id: id,
            from_status: initiative.status,
            to_status: nextStatus,
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: `Reviewed business case (Status: ${business_case_status}, Impact Class: ${initiative_impact_class})`
        });
        webhookService_1.WebhookService.triggerPowerAutomate("Initiative Reviewed", updated);
        res.json({ success: true, message: "Review recorded successfully.", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC5: ASSESS AN INITIATIVE REQUEST
// -------------------------------------------------------------
router.post('/:id/assess', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { solarch_report_status, solarch_report_url } = req.body;
        if (!solarch_report_status) {
            return res.status(400).json({ success: false, message: "Solutions Architecture assessment report status is required." });
        }
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const originalStatus = initiative.status;
        const nextStatus = solarch_report_status === 'Completed' ? 'Assessed' : originalStatus;
        const updated = dbService_1.DbService.updateInitiative(id, {
            solarch_report_status,
            solarch_report_url: solarch_report_url || "https://sharepoint.unisa.local/sites/idm/solarch-reports/" + initiative.request_number + "_assessment.pdf",
            status: nextStatus,
            assessment_date: new Date().toISOString()
        });
        dbService_1.DbService.addHistory({
            initiative_id: id,
            from_status: originalStatus,
            to_status: nextStatus,
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: `Solutions Architecture Assessment Report set to: ${solarch_report_status}`
        });
        webhookService_1.WebhookService.triggerPowerAutomate("Solutions Architecture Assessed", updated);
        res.json({ success: true, message: "Solutions Architecture assessment saved successfully.", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC6: RECOMMEND INITIATIVE REQUEST
// -------------------------------------------------------------
router.post('/:id/recommend', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { recommendation, solarch_meeting_date } = req.body; // 'Recommended' | 'Declined' | 'Referred Back'
        if (!recommendation) {
            return res.status(400).json({ success: false, message: "Recommendation decision is required." });
        }
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const originalStatus = initiative.status;
        const updated = dbService_1.DbService.updateInitiative(id, {
            status: recommendation,
            solarch_meeting_date: solarch_meeting_date || new Date().toISOString(),
            recommendation_date: new Date().toISOString()
        });
        dbService_1.DbService.addHistory({
            initiative_id: id,
            from_status: originalStatus,
            to_status: recommendation,
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: `Solutions Architecture Secretariat recommendation decision logged: ${recommendation}`
        });
        webhookService_1.WebhookService.triggerPowerAutomate("Committee Recommendation", updated);
        res.json({ success: true, message: `Recommendation logged successfully as: ${recommendation}`, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// -------------------------------------------------------------
// UC7: APPROVE INITIATIVE REQUEST AS A PROJECT
// -------------------------------------------------------------
router.post('/:id/approve', (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { approval_action, steerco_meeting_date, project_priority_score, project_rating } = req.body; // 'Approved' | 'Declined' | 'Referred Back'
        if (!approval_action) {
            return res.status(400).json({ success: false, message: "SteerCo approval action decision is required." });
        }
        const initiative = dbService_1.DbService.getInitiativeById(id);
        if (!initiative) {
            return res.status(404).json({ success: false, message: "Initiative not found" });
        }
        const originalStatus = initiative.status;
        const updated = dbService_1.DbService.updateInitiative(id, {
            status: approval_action,
            steerco_meeting_date: steerco_meeting_date || new Date().toISOString(),
            project_priority_score: project_priority_score !== undefined ? Number(project_priority_score) : undefined,
            project_rating: project_rating || undefined,
            decision_date: new Date().toISOString(),
            handover_date: approval_action === 'Approved' ? new Date().toISOString() : undefined
        });
        dbService_1.DbService.addHistory({
            initiative_id: id,
            from_status: originalStatus,
            to_status: approval_action,
            updated_by_email: user.email,
            updated_by_name: user.name,
            comments: `ICT SteerCo Secretariat decision logged: ${approval_action}. Priority rating: ${project_rating} (Score: ${project_priority_score})`
        });
        webhookService_1.WebhookService.triggerPowerAutomate("Governance SteerCo Approval", updated);
        res.json({ success: true, message: `SteerCo decision successfully logged as: ${approval_action}`, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;

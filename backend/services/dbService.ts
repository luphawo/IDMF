import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Initiative {
    id: string;
    request_number: string;
    name: string;
    request_date: string;
    
    // Actors
    requester_email: string;
    requester_name: string;
    requester_unit: string;
    owner_email: string;
    owner_name: string;
    owner_unit: string;
    reviewer_email?: string;
    reviewer_name?: string;
    
    // Main Intake Details
    background: string;
    objective: string;
    potential_benefits: string;
    alignment_strategy: string;
    
    // Capability Mapping
    capability_type: string;
    capability_group: string;
    capability_title: string;
    
    // High Level Impact Analysis
    impact_description: string;
    budget_estimate: number;
    affected_parties: string;
    time_estimate: string;
    
    // Status Trackers
    status: string; // 'Draft' | 'Submitted' | 'Accepted' | 'Declined' | 'Parked' | 'Reviewed' | 'SolArch' | 'Assessed' | 'Recommended' | 'Approved' | 'Referred Back'
    decline_reason?: string;
    
    // Dates tracking for reporting (UC8)
    acceptance_date?: string;
    review_date?: string;
    assessment_date?: string;
    recommendation_date?: string;
    decision_date?: string;
    handover_date?: string;
    
    // UC4 Business Case Details
    business_case_status: string; // 'In-Progress' | 'Signed-Fully'
    business_case_url?: string;
    initiative_impact_class?: string; // 'Small (Minor)' | 'Medium' | 'High'
    
    // UC5 Solutions Architecture Assessment
    solarch_report_status: string; // 'In-Progress' | 'Completed'
    solarch_report_url?: string;
    
    // UC6 Meeting Scheduling
    solarch_meeting_date?: string;
    
    // UC7 SteerCo Scheduling & Priority Rating
    steerco_meeting_date?: string;
    project_priority_score?: number; // 1-100
    project_rating?: string; // 'High' | 'Medium' | 'Low'
}

export interface WorkflowHistory {
    history_id: string;
    initiative_id: string;
    from_status: string | null;
    to_status: string;
    updated_by_email: string;
    updated_by_name: string;
    updated_at: string;
    comments?: string;
}

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'idmp_store.json');

export class DbService {
    private static initStore() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(DB_FILE)) {
            const initialData = {
                initiatives: [
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
                        objective: "Deploy a modern single-page Next.js portal integrating course schedules and strategic academic modules.",
                        potential_benefits: "40% reduction in enrollment support times, cleaner registration cycles.",
                        alignment_strategy: "Pillar 1: Advance Technology Mediated, Quality Learning and Teaching",
                        capability_type: "Learning & Teaching",
                        capability_group: "Student Admission",
                        capability_title: "Study Application Management",
                        impact_description: "System will replace primary legacy portals for student-facing web platforms.",
                        budget_estimate: 850000.00,
                        affected_parties: "All academic departments, registry teams, and 200,000+ students.",
                        time_estimate: "12 Months",
                        status: "Submitted",
                        business_case_status: "In-Progress",
                        solarch_report_status: "In-Progress"
                    }
                ],
                history: [
                    {
                        history_id: "hist-1",
                        initiative_id: "init-1",
                        from_status: "Draft",
                        to_status: "Submitted",
                        updated_by_email: "jane.doe@unisa.ac.za",
                        updated_by_name: "Jane Doe",
                        updated_at: new Date().toISOString(),
                        comments: "Initial draft submitted with strategy alignment and capability mappings."
                    }
                ]
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
        }
    }

    public static getStore() {
        this.initStore();
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    }

    private static saveStore(data: any) {
        this.initStore();
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

    public static getInitiatives(): Initiative[] {
        return this.getStore().initiatives;
    }

    public static getInitiativeById(id: string): Initiative | undefined {
        return this.getInitiatives().find(i => i.id === id);
    }

    public static addInitiative(initiative: Omit<Initiative, 'id'>): Initiative {
        const store = this.getStore();
        const newInit: Initiative = {
            ...initiative,
            id: 'init-' + uuidv4().substring(0, 8)
        };
        store.initiatives.push(newInit);
        this.saveStore(store);
        return newInit;
    }

    public static updateInitiative(id: string, updates: Partial<Initiative>): Initiative {
        const store = this.getStore();
        const index = store.initiatives.findIndex((i: any) => i.id === id);
        if (index === -1) {
            throw new Error(`Initiative with ID ${id} not found.`);
        }
        
        const existing = store.initiatives[index];
        const updated = {
            ...existing,
            ...updates
        };
        
        store.initiatives[index] = updated;
        this.saveStore(store);
        return updated;
    }

    public static addHistory(history: Omit<WorkflowHistory, 'history_id' | 'updated_at'>): WorkflowHistory {
        const store = this.getStore();
        const newHistory: WorkflowHistory = {
            ...history,
            history_id: 'hist-' + uuidv4().substring(0, 8),
            updated_at: new Date().toISOString()
        };
        store.history.push(newHistory);
        this.saveStore(store);
        return newHistory;
    }

    public static getHistoryForInitiative(initiativeId: string): WorkflowHistory[] {
        return this.getStore().history.filter((h: any) => h.initiative_id === initiativeId);
    }
}

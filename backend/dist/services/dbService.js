"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'idmp_store.json');
class DbService {
    static initStore() {
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
    static getStore() {
        this.initStore();
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    }
    static saveStore(data) {
        this.initStore();
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    }
    static getInitiatives() {
        return this.getStore().initiatives;
    }
    static getInitiativeById(id) {
        return this.getInitiatives().find(i => i.id === id);
    }
    static addInitiative(initiative) {
        const store = this.getStore();
        const newInit = {
            ...initiative,
            id: 'init-' + (0, uuid_1.v4)().substring(0, 8)
        };
        store.initiatives.push(newInit);
        this.saveStore(store);
        return newInit;
    }
    static updateInitiative(id, updates) {
        const store = this.getStore();
        const index = store.initiatives.findIndex((i) => i.id === id);
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
    static addHistory(history) {
        const store = this.getStore();
        const newHistory = {
            ...history,
            history_id: 'hist-' + (0, uuid_1.v4)().substring(0, 8),
            updated_at: new Date().toISOString()
        };
        store.history.push(newHistory);
        this.saveStore(store);
        return newHistory;
    }
    static getHistoryForInitiative(initiativeId) {
        return this.getStore().history.filter((h) => h.initiative_id === initiativeId);
    }
}
exports.DbService = DbService;

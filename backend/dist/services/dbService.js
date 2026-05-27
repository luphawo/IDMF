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
                initiatives: [],
                history: []
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

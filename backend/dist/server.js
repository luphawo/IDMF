"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const workflowRouter_1 = __importDefault(require("./routes/workflowRouter"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
// Middlewares
app.use((0, cors_1.default)({
    origin: '*', // Allow connections from frontend portals
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-role', 'x-email', 'x-name', 'x-unit']
}));
app.use(express_1.default.json());
// Serve premium frontend interface directly on root path
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend')));
// Main Workflow Router API mount
app.use('/api/initiatives', workflowRouter_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'IDM Platform Backend API Services',
        environment: 'Development (Mock Auth Active)'
    });
});
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 IDM Governance Orchestration Platform Backend is Active`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}`);
    console.log(`🛡️  SSO Identity Mode: Mock Entra ID integration (x-role active)`);
    console.log(`📁 Local Data Storage persisted in backend/data/idmp_store.json`);
    console.log(`================================================================`);
});
